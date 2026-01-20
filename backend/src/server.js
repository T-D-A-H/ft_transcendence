const Fastify     			   = require("fastify");
const websocket   			   = require("@fastify/websocket");
const fastify     			   = Fastify({ logger: true });

const bcrypt      			   = require("bcryptjs");
const db          			   = require("./init_db.js");
const saltRounds			   = 12;

const UserManager              = require("./Classes/UserManager.js");
const userManager              = new UserManager();
const buildGameSocketHandler   = require("./game.js");

const { buildRegisterHandler } = require("./endpoints/register.js");
const buildSet2FAHandler       = require('./endpoints/set2FA.js');
const verify2FACode            = require("./endpoints/verify2FA.js");
const buildLoginHandler        = require("./endpoints/login.js");
const buildLogoutHandler       = require('./endpoints/logout.js');

const FRAMES = 1000/60;

fastify.register(require('fastify-jwt'), {secret: process.env.JWT_SECRET});



async function startServer() {
	
	await fastify.register(websocket);

	// UN SOLO ENDPOINT DE LOGIN (unificado y seguro)
	const loginHandler = buildLoginHandler(db, bcrypt, userManager, fastify);
	fastify.post("/login", loginHandler);

	// Verificación de código 2FA
	const verify2FAmail = verify2FACode(userManager, fastify);
	fastify.post("/verify-2fa-mail", verify2FAmail);

	// Registro de usuarios
	const registerHandler = buildRegisterHandler(db, bcrypt, saltRounds, fastify);
	fastify.post("/register", registerHandler);

	// SET 2FA de usuarios
	fastify.post("/set-2fa", buildSet2FAHandler(db, fastify));

	// LOGOUT
	fastify.post("/logout", buildLogoutHandler(userManager, fastify));


	// WebSocket del juego
	const initGameSocket = buildGameSocketHandler(userManager, fastify);
	fastify.get("/proxy-game", { websocket: true }, initGameSocket);
	
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
