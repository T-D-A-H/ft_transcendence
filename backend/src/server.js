const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../database/blokchain/.env') });

const Fastify     			   = require("fastify");
const websocket   			   = require("@fastify/websocket");
const fastify     			   = Fastify({ logger: true });

const bcrypt      			   = require("bcryptjs");
const db          			   = require("./init_db.js");
const saltRounds			   = 12;

const UserManager              = require("./Classes/UserManager.js");
const userManager = new UserManager(db);
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

function setTokenCookie(reply, token) {
	reply.setCookie('accessToken', token, {
		httpOnly: true,      // No accesible desde JS
		secure: true,        // Solo HTTPS
		sameSite: 'strict',  // CSRF protection
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 DÍAS (en milisegundos)
		path: '/'
	});
}

async function authFromCookie(request, reply) {

	const token = request.cookies?.accessToken;
	if (!token) {
		return reply.code(401).send({ error: "No token" });
	}

	let decoded;
	try {
		decoded = fastify.jwt.verify(token);
	} catch (err) {
		return reply.code(401).send({ error: "Invalid token" });
	}

	const player = userManager.getUserByID(decoded.id);
	if (!player) {
		return reply.code(401).send({ error: "User not found" });
	}

	request.user = player;
}

async function startServer() {
	
	await fastify.register(websocket);

	// ✅ Registro de usuarios
	const signupHandler  = require("./endpoints/auth/signup.js");
	fastify.post("/api/sign-up", signupHandler(db, bcrypt, saltRounds, fastify));

	// ✅  Login de usuarios
	const loginHandler = require("./endpoints/auth/login.js");;
	fastify.post("/api/login", loginHandler(db, bcrypt, userManager, fastify, setTokenCookie));

	// ✅ Logout del usuario
	const buildLogoutHandler = require('./endpoints/auth/logout.js');
	fastify.post("/api/logout", buildLogoutHandler(userManager, fastify));

	// ✅ Verificación de código 2FA
	const verify2FAhandle = require("./endpoints/auth/verify2FA.js");
	fastify.post("/api/verify-2fa", verify2FAhandle(userManager, fastify, setTokenCookie));

	// ✅ SET 2FA de usuarios
	const buildSet2FAHandler = require('./endpoints/auth/set2FA.js');
	fastify.post("/api/set-2fa", buildSet2FAHandler(db, fastify));

	// ✅ Google OAuth - ahora setea cookies
	const googleCallback = require("./endpoints/auth/googleCallback.js");
	fastify.get("/auth/google/callback", googleCallback(userManager, fastify, db, setTokenCookie));

	// ✅ Cambiar Display Name
	const changeDisplayName = require("./endpoints/user/change_displayName.js");
	fastify.post("/api/change-display-name", changeDisplayName(userManager, fastify, db));

	// ✅ Cambiar username
	const changeUserName = require("./endpoints/user/change_userName.js");
	fastify.post("/api/change-username", changeUserName(userManager, fastify, db));

	// ✅ Cambiar email
	const changeEmail = require("./endpoints/user/change_Email.js");
	fastify.post("/api/change-email", changeEmail(fastify, db));

	// ✅ Cambiar pass
	const changePass = require("./endpoints/user/change_Pass.js");
	fastify.post("/api/change-pass", changePass(fastify, db,bcrypt, saltRounds));

	// ✅ Cambiar avatar
	const changeAvatar = require("./endpoints/user/change_avatar.js");
	fastify.post("/api/change-avatar", changeAvatar(userManager, fastify, db));

	// ✅ Guardar partida (cualquier tipo)
	const buildMatchResultHandler = require("./endpoints/user/matchResult.js");
	fastify.post("/api/match-result", buildMatchResultHandler(db, fastify));

	// API para websocket
	const websocketHandler = require("./endpoints/user/websocket.js");
	fastify.register(websocketHandler, {prefix: '/api/games', userManager, authFromCookie});

	// API para torneos
	const tournamentsHandler = require("./endpoints/user/tournaments.js");
	fastify.register(tournamentsHandler, {prefix: '/api/tournaments', userManager, authFromCookie});

	// API para partidas
	const matchesHandler = require("./endpoints/user/matches.js");
	fastify.register(matchesHandler, {prefix: '/api/matches', userManager, authFromCookie});

	// API para info de perfiles
	const infoHandler = require("./endpoints/user/info.js");
	fastify.register(infoHandler, {prefix: '/api/users', userManager, authFromCookie});

	// API para friends
	const friendsHandler = require("./endpoints/user/friends.js");
	fastify.register(friendsHandler, {prefix: '/api/friends', userManager, authFromCookie});

	setInterval(() => {

		userManager.updateMatches();
		userManager.updateTournaments();

	}, FRAMES);


/* 	try {
		await userManager.initializeBlockchain();
		console.log("Blockchain service initialized");
	} catch (error) {
		console.log("Blockchain service not available:", error.message);
	} */
	
	try {
		await fastify.listen({ port: 3000, host: "0.0.0.0" });
		console.log("Backend ON en 3000");
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

startServer();
