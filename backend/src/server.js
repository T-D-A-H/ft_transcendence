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
const verify2FACode = require("../endpoints/login.js");
const buildLoginHandler = require("../endpoints/login2FA.js");

const FRAMES = 1000/60;
const SPEED = 8;

fastify.register(require('fastify-jwt'), {
  secret: process.env.JWT_SECRET
});

async function startServer() {
	
	await fastify.register(websocket);

	// Login Normal option == 0
	const loginHandler = buildLoginHandler(db, bcrypt, userManager, fastify, "skip");
	fastify.post("/login", loginHandler);

	// Login 2FA mail option == 1
	const Login2FAmailHandler = buildLoginHandler(db, bcrypt, userManager, fastify, "2FAmail");
    fastify.post("/login-2fa-mail", Login2FAmailHandler);
	
	const verify2FAmail = verify2FACode(userManager, fastify);
	fastify.post("/verify-2fa-mail", verify2FAmail);

	// REGISTRO
	const registerHandler = buildRegisterHandler(db, bcrypt, saltRounds, User, userManager);
	fastify.post("/register", registerHandler);

	// GAME
	const initGameSocket = buildGameSocketHandler(userManager, fastify);
	fastify.get("/proxy-game", { websocket: true }, initGameSocket);



	setInterval(() => {
	    userManager.matches.forEach(match => {
	        if (!match.isActive) return;
	        if (!match.players[0].socket || !match.players[1].socket) return;
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
