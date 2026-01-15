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


function randomName()
{
	const TEST_NAMES = [
	"AliceXZY",
	"Robertzo420",
	"Carlosss",
	"DianaM",
	"Evangelinga",
	"Frankomanca",
	"Gracio",
	"HeidiClum",
	"MrYakul",
	"olibearzz",
	"jaimesan",
	"fdurban",
	"mgrillo",
	"irlozano",
	"ctommasi",
	"valhallao",
	"helvetteo",
	];
	const idx = Math.floor(Math.random() * TEST_NAMES.length);
	return (TEST_NAMES[idx]);
}

function createTestUsers(count)
{
	let size = 2;
	const TEST_NAMES = [
	"AGuyOnTheCouch",
	"Robertzo420",
	"WiFightClub",
	"DonutDestroyer",
	"MyBadBro",
	"ObiWanCannoli",
	"LordOfTheFlies",
	"AverageLavigne",
	"MrYakul",
	"olibearzz",
	"jaimesan",
	"fdurban",
	"mgrillo",
	"irlozano",
	"ctommasi",
	"valhallao",
	"YeetTheRich",
	"PanicAtTheMenu",
	"OprahWindfury",
	"CTRLAltDefeat",
	"Fedora_The_Explorer",
	"CheesyToe"
	];
	for (let i = 0; i < count; i++)
	{
		const user_id = userManager.createId();
		const name = TEST_NAMES[i % TEST_NAMES.length];

		const user_name = name;
		const display_name = name;
		const user_socket = null; 

		const user = userManager.createUser(user_id, user_name, display_name, user_socket);

		userManager.addUser(user);
		userManager.loginUser(user_id);

		const tournament = userManager.createTournament(user, display_name, size);
		if (size % 3 === 0) {
			tournament.setTESTING();
			tournament.currentPlayerCount = size;
			tournament.setReady();
		}
		size += 2;
	}
}
createTestUsers(24);


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
