const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../database/blokchain/.env') });

const Fastify     			   = require("fastify");
const websocket   			   = require("@fastify/websocket");
const fastify     			   = Fastify({ logger: true });

const bcrypt      			   = require("bcryptjs");
const db          			   = require("./init_db.js");
const saltRounds			   = 12;

const UserManager              = require("./Classes/UserManager.js");
const userManager			   = new UserManager(db);
const oauthPlugin			   = require("@fastify/oauth2");
const googleCallback = require("./api/google/googleCallback.js");

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

	fastify.register(require('./api/users/users.js'), { prefix: '/api/users', db, saltRounds, bcrypt, fastify, authFromCookie, userManager});

    fastify.register(require('./api/sessions/sessions.js'), { prefix: '/api/sessions', db, bcrypt, fastify, setTokenCookie, userManager});

	fastify.get("/auth/google/callback", googleCallback(userManager, fastify, db, setTokenCookie));

    fastify.register(require('./api/matches/matches.js'), { prefix: '/api/matches', authFromCookie, fastify, userManager, db});

	fastify.register(require('./api/tournaments/tournaments.js'), { prefix: '/api/tournaments', authFromCookie, fastify, userManager});

	fastify.register(require('./api/games/games.js'), { prefix: '/api/games', db, fastify, authFromCookie, userManager});

	fastify.register(require('./api/friends/friends.js'), { prefix: '/api/friends', db, fastify, authFromCookie, userManager});


	setInterval(() => {

		userManager.updateMatches();
		userManager.updateTournaments();

	}, FRAMES);


	try {
			await userManager.initializeBlockchain();
			console.log("Blockchain service initialized");
		} catch (error) {
			console.log("Blockchain service not available:", error.message);
		}
	
	try {
		await fastify.listen({ port: 3000, host: "0.0.0.0" });
		console.log("Backend ON en 3000");
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

startServer();
