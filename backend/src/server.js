const Fastify     			   = require("fastify");
const websocket   			   = require("@fastify/websocket");
const fastify     			   = Fastify({ logger: true });

const bcrypt      			   = require("bcryptjs");
const db          			   = require("./init_db.js");
const saltRounds			   = 12;

const UserManager              = require("./Classes/UserManager.js");
const userManager = new UserManager();
const buildGameSocketHandler = require("./game.js");
const oauthPlugin = require("@fastify/oauth2");

const FRAMES = 1000/60;

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

	// ✅ Registro de usuarios
	const signupHandler  = require("./endpoints/signup.js");
	fastify.post("/api/sign-up", signupHandler(db, bcrypt, saltRounds, fastify));

	// ✅  Login de usuarios
	const loginHandler = require("./endpoints/login.js");;
	fastify.post("/api/login", loginHandler(db, bcrypt, userManager, fastify, setTokenCookie));

	// ✅ Logout del usuario
	const buildLogoutHandler = require('./endpoints/logout.js');
	fastify.post("/api/logout", buildLogoutHandler(userManager, fastify));

	// ✅ WebSocket del juego - extraer token de cookies
	const initGameSocket = buildGameSocketHandler(userManager);
	fastify.get("/proxy-game", { websocket: true }, async (socket, req) => {
		const token = req.cookies?.accessToken;

		if (!token) {
			socket.close(1008, "No token provided");
			return;
		}
		try {
			const decoded = fastify.jwt.verify(token);
			await initGameSocket(socket, decoded.id);
		} catch (err) {
			socket.close(1008, "Invalid token");
		}
	});

	// ✅ Verificación de código 2FA
	const verify2FAhandle = require("./endpoints/verify2FA.js");
	fastify.post("/api/verify-2fa", verify2FAhandle(userManager, fastify, setTokenCookie));

	// ✅ SET 2FA de usuarios
	const buildSet2FAHandler = require('./endpoints/set2FA.js');
	fastify.post("/api/set-2fa", buildSet2FAHandler(db, fastify));

	// ✅ Validar token (verificar si sesión activa)
	const validateToken = require("./endpoints/validateToken.js");
	fastify.get("/api/validate-token", validateToken(userManager, fastify));

	// ✅ Google OAuth - ahora setea cookies
	const googleCallback = require("./endpoints/googleCallback.js");
	fastify.get("/auth/google/callback", googleCallback(userManager, fastify, db, setTokenCookie));

	setInterval(() => {

		userManager.updateGames();

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
