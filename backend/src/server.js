const Fastify = require("fastify");
const websocket = require("@fastify/websocket");
const fastify = Fastify({ logger: true });

const bcrypt = require("bcryptjs");
const db = require("./init_db");
const saltRounds = 12;

const Match = require("./Match.js");
const User = require("./User.js");
const UserManager = require("./UserManager.js");
const userManager = new UserManager();
const { buildRegisterHandler } = require("./register");
const buildGameSocketHandler = require("./game.js");

// LOGIN 2FA MAIL
const verify2FACode = require("./endpoints/verify2FA.js");
const buildLoginHandler = require("./endpoints/login.js");

const FRAMES = 1000 / 60;
const SPEED = 8;

fastify.register(require("fastify-jwt"), {
  secret: process.env.JWT_SECRET,
});

async function startServer() {
  await fastify.register(websocket);

  // ✅ UN SOLO ENDPOINT DE LOGIN (unificado y seguro)
  const loginHandler = buildLoginHandler(db, bcrypt, userManager, fastify);
  fastify.post("/login", loginHandler);

  // ✅ Verificación de código 2FA
  const verify2FAmail = verify2FACode(userManager, fastify);
  fastify.post("/verify-2fa-mail", verify2FAmail);

  // ✅ Registro de usuarios
  const registerHandler = buildRegisterHandler(db, bcrypt, saltRounds, fastify);
  fastify.post("/register", registerHandler);

  // ✅ SET 2FA de usuarios
  const buildSet2FAHandler = require("./endpoints/set2FA");
  fastify.post("/set-2fa", buildSet2FAHandler(db, fastify));

  // ✅ WebSocket del juego
  const initGameSocket = buildGameSocketHandler(userManager, fastify);
  fastify.get("/proxy-game", { websocket: true }, initGameSocket);

  const buildLogoutHandler = require("./endpoints/logout");
  fastify.post("/logout", buildLogoutHandler(userManager, fastify));

  setInterval(() => {
    userManager.matches.forEach((match) => {
      if (match.isWaiting) return;
      if (match.isAIMatch) {
        if (!match.players[0].socket) return;
      } else {
        if (!match.players[0].socket || !match.players[1].socket) return;
      }
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
