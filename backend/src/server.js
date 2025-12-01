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
const buildLoginHandler = require("./login");
const { buildRegisterHandler } = require("./register");
const buildGameSocketHandler = require("./game.js")

const FRAMES = 1000/60;
const SPEED = 8;


fastify.register(require('fastify-jwt'), {
	secret: process.env.JWT_SECRET || 'supersecret' //! Hay que guardar la clave en el .ENV
})

async function startServer() {
	
	await fastify.register(websocket);

	const loginHandler = buildLoginHandler(db, bcrypt, userManager, fastify);
	fastify.post("/login", loginHandler);
	
	const registerHandler = buildRegisterHandler(db, bcrypt, saltRounds, User, userManager);
	fastify.post("/register", registerHandler);

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
