
module.exports = async function sessionsRoutes(fastify, options) {
    
    const { userManager, db, bcrypt, setTokenCookie } = options;

    // LOGIN
    const loginHandler = require("./services/login.js");
	fastify.post("/", loginHandler(db, bcrypt, userManager, fastify, setTokenCookie));

    // VERIFY 2fa
    const verify2FAhandle = require("./services/verify2FA.js");
	fastify.patch("/current", verify2FAhandle(userManager, fastify, setTokenCookie));

    // LOGOUT
    const buildLogoutHandler = require('./services/logout.js');
	fastify.delete("/current", buildLogoutHandler(userManager, fastify));
}
