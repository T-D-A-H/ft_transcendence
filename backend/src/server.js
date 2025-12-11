const Fastify     = require("fastify");
const websocket   = require("@fastify/websocket");
const fastify     = Fastify({ logger: true });

const bcrypt      = require("bcryptjs");
const db          = require("./init_db");
const saltRounds  = 12;

const Match       = require("./Match.js")
const User        = require("./User.js");
const UserManager = require("./UserManager.js");
const userManager = new UserManager();
const { buildRegisterHandler } = require("./register");
const buildGameSocketHandler = require("./game.js");


// LOGIN 2FA MAIL
const verify2FACode = require("./endpoints/verify2FA.js");
const buildLoginHandler = require("./endpoints/login.js");
const oauthPlugin = require("@fastify/oauth2");

const FRAMES = 1000/60;
const SPEED = 8;

fastify.register(require('fastify-jwt'), {
	secret: process.env.JWT_SECRET
});

fastify.register(require('@fastify/cookie'));

fastify.register(oauthPlugin, {
	name: "googleOAuth2",
	credentials: {
		client: {
			id: process.env.GOOGLE_CLIENT_ID,
			secret: process.env.GOOGLE_CLIENT_SECRET
		},
		auth: require('@fastify/oauth2').GOOGLE_CONFIGURATION
	},
	startRedirectPath: "/auth/google",
	callbackUri: "https://localhost:4000/auth/google/callback",
	scope: ['email', 'profile']
});

function setTokenCookie(reply, token, maxAge = 15 * 60 * 1000) {
	reply.setCookie('accessToken', token, {
		httpOnly: true,      // No accesible desde JS
		secure: true,        // Solo HTTPS
		sameSite: 'strict',  // CSRF protection
		maxAge: maxAge,      // 15 minutos por defecto
		path: '/'
	});
}

async function startServer() {
	
	await fastify.register(websocket);

	// ✅ UN SOLO ENDPOINT DE LOGIN (unificado y seguro)
	const loginHandler = buildLoginHandler(db, bcrypt, userManager, fastify, setTokenCookie);
	fastify.post("/api/login", loginHandler);

	// ✅ Verificación de código 2FA
	const verify2FAmail = verify2FACode(userManager, fastify, setTokenCookie);
	fastify.post("/api/verify-2fa-mail", verify2FAmail);

	// ✅ Registro de usuarios
	const registerHandler = buildRegisterHandler(db, bcrypt, saltRounds, fastify);
	fastify.post("/api/sign-up", registerHandler);

	// ✅ SET 2FA de usuarios
	const buildSet2FAHandler = require('./endpoints/set2FA');
	fastify.post("/api/set-2fa", buildSet2FAHandler(db, fastify));

	// ✅ WebSocket del juego - extraer token de cookies
	const initGameSocket = buildGameSocketHandler(userManager, fastify);
	fastify.get("/proxy-game", { websocket: true }, async (socket, req) => {
		// Extraer token de la cookie
		const token = req.cookies?.accessToken;
		
		if (!token) {
			socket.close(1008, "No token provided");
			return;
		}
		
		try {
			const decoded = fastify.jwt.verify(token);
			// Pasar el userId al handler del game
			await initGameSocket(socket, req, decoded.id);
		} catch (err) {
			socket.close(1008, "Invalid token");
		}
	});

	// ✅ Logout del juego
	const buildLogoutHandler = require('./endpoints/logout');
	fastify.post("/api/logout", buildLogoutHandler(userManager, fastify));

	// ✅ Validar token (verificar si sesión activa)
	fastify.get("/api/validate-token", async (req, reply) => {
		try {
			// El token viene en la cookie automáticamente
			const token = req.cookies.accessToken;
			
			if (!token) {
				return reply.code(401).send({ valid: false });
			}
			
			const decoded = fastify.jwt.verify(token);
			const player = userManager.getUser(decoded.id);
			
			if (!player || !player.isConnected) {
				return reply.code(401).send({ valid: false });
			}
			
			return reply.send({ valid: true });
		} catch (err) {
			return reply.code(401).send({ valid: false });
		}
	});

	// ✅ Refresh token (generar nuevo accessToken)
	fastify.post("/api/refresh-token", async (req, reply) => {
		try {
			const token = req.cookies.accessToken;
			
			if (!token) {
				return reply.code(401).send({ status: "error", error: "No token" });
			}
			
			const decoded = fastify.jwt.verify(token);
			const player = userManager.getUser(decoded.id);
			
			if (!player) {
				return reply.code(401).send({ status: "error", error: "User not found" });
			}
			
			const newToken = fastify.jwt.sign({ 
				id: decoded.id, 
				display_name: decoded.display_name 
			});
			
			setTokenCookie(reply, newToken);
			return reply.send({ status: "ok" });
		} catch (err) {
			return reply.code(401).send({ status: "error", error: "Token invalid" });
		}
	});


	// ! Gestionar Errores (mensajes)tanto de Registro y Login 
	// ! También Checkar lo de google con lo del los correos y auth_id
	// ! Y configurar el userInfo.given_name
	// ✅ Google OAuth - ahora setea cookies
	fastify.get("/auth/google/callback", async (request, reply) => {
		try {
			const token = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
			const userInfo = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
				headers: { Authorization: `Bearer ${token.token.access_token}` }
			}).then(res => res.json());

			const userId = await new Promise((resolve, reject) => {
				db.get("SELECT id FROM users WHERE oauth_provider = ? AND oauth_id = ?", ["google", userInfo.id], (err, row) => {
					if (err) return reject(err);

					if (row) return resolve(row.id);

					db.get("SELECT id FROM users WHERE email = ?", [userInfo.email], (err2, existingUser) => {
						if (err2) return reject(err2);

						if (existingUser) {
							db.run(
								"UPDATE users SET oauth_provider = ?, oauth_id = ? WHERE id = ?",
								["google", userInfo.id, existingUser.id],
								(err3) => {
									if (err3) reject(err3);
									else resolve(existingUser.id);
								}
							);
						} else {
							db.run(
								"INSERT INTO users (username, display_name, email, password, twofa, oauth_provider, oauth_id) VALUES (?,?,?,?,?,?,?)",
								[userInfo.name, userInfo.given_name, userInfo.email, '', "skip", "google", userInfo.id],
								function(insertErr) {
									if (insertErr) reject(insertErr);
									else resolve(this.lastID);
								}
							);
						}
					});
				});
			});

			const jwtToken = fastify.jwt.sign({ id: userId, email: userInfo.email });

			let player = userManager.getUser(userId);
			if (!player) {
				player = new User({
					id: userId,
					username: userInfo.name,
					display_name: userInfo.given_name,
					socket: null
				});
				userManager.addUser(player);
			}
			if (userManager.loginUser(userId) === false) {
				return reply.code(401).send({ 
					status: "error",
					error: "Usuario ya logeado" 
				});
			}

			// Setear cookie en lugar de enviar en URL
			setTokenCookie(reply, jwtToken);
			
			// Redirigir sin token en URL
			reply.redirect(`/`);
			
		} catch (err) {
			console.error(err);
			reply.send({ status: "error", error: "OAuth failed" });
		}
	});

	setInterval(() => {
	    userManager.matches.forEach(match => {
	        if (match.isWaiting) return;
	        if (!match.players[0].socket || !match.players[1].socket) return;
			if (match.isReady[0] === true && match.isReady[1] === true)
	        	match.sendState(SPEED);
	    });
	}, FRAMES);

	try {
		await fastify.listen({ port: 3000, host: "0.0.0.0" });
		console.log("Backend ON en 3000");
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

startServer();
