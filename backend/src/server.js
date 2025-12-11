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

async function startServer() {
	
	await fastify.register(websocket);

	// ✅ UN SOLO ENDPOINT DE LOGIN (unificado y seguro)
	const loginHandler = buildLoginHandler(db, bcrypt, userManager, fastify);
	fastify.post("/api/login", loginHandler);

	// ✅ Verificación de código 2FA
	const verify2FAmail = verify2FACode(userManager, fastify);
	fastify.post("/api/verify-2fa-mail", verify2FAmail);

	// ✅ Registro de usuarios
	const registerHandler = buildRegisterHandler(db, bcrypt, saltRounds, fastify);
	fastify.post("/api/sign-up", registerHandler);

	// ✅ SET 2FA de usuarios
	const buildSet2FAHandler = require('./endpoints/set2FA');
	fastify.post("/api/set-2fa", buildSet2FAHandler(db, fastify));

	// ✅ WebSocket del juego
	const initGameSocket = buildGameSocketHandler(userManager, fastify);
	fastify.get("/proxy-game", { websocket: true }, initGameSocket);

	// ✅ Logout del juego
	const buildLogoutHandler = require('./endpoints/logout');
	fastify.post("/api/logout", buildLogoutHandler(userManager, fastify));


	// ! Gestionar Errores (mensajes)tanto de Registro y Login 
	// ! También Checkar lo de google con lo del los correos y auth_id
	// ! Y configurar el userInfo.given_name
	fastify.get("/auth/google/callback", async (request, reply) => {
		try {
			const token = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
			const userInfo = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
				headers: { Authorization: `Bearer ${token.token.access_token}` }
			}).then(res => res.json());

			// Insertar usuario si no existe
			const userId = await new Promise((resolve, reject) => {
				// 1. Buscar por oauth_id
				db.get("SELECT id FROM users WHERE oauth_provider = ? AND oauth_id = ?", ["google", userInfo.id], (err, row) => {
					if (err) return reject(err);

					if (row) return resolve(row.id); // caso 1

					// 2. Buscar por email
					db.get("SELECT id FROM users WHERE email = ?", [userInfo.email], (err2, existingUser) => {
						if (err2) return reject(err2);

						if (existingUser) {
							// Vincular Google a usuario existente
							db.run(
								"UPDATE users SET oauth_provider = ?, oauth_id = ? WHERE id = ?",
								["google", userInfo.id, existingUser.id],
								(err3) => {
									if (err3) reject(err3);
									else resolve(existingUser.id); // caso 2
								}
							);
						} else {
							// 3. Crear nuevo usuario
							db.run(
								"INSERT INTO users (username, display_name, email, password, twofa, oauth_provider, oauth_id) VALUES (?,?,?,?,?,?,?)",
								[userInfo.name, userInfo.given_name, userInfo.email, '', "skip", "google", userInfo.id],
								function(insertErr) {
									if (insertErr) reject(insertErr);
									else resolve(this.lastID); // caso 3
								}
							);
						}
					});
				});
			});

			// Crear JWT
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
			if (userManager.loginUser(userId) ===  false) {
				return reply.code(401).send({ 
					status: "error",
					error: "Usuario ya logeado" 
				});
			}

			// Redirigir al frontend con token
			reply.redirect(`/?token=${jwtToken}`);
			
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
