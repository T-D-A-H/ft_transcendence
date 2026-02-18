const signupHandler  = require("./services/register.js");
const buildSet2FAHandler = require('./services/set2FA.js');
const changeDisplayName = require("./services/change-displayname.js");
const changeUserName = require("./services/change-username.js");
const changeEmail = require("./services/change-email.js");
const changePass = require("./services/change-password.js");
const changeAvatar = require("./services/change-avatar.js");
const userInfo = require("./services/info.js");
const LOGGER 	 = require("../../LOGGER.js");


module.exports = async function usersRoutes(fastify, options) {

	const { userManager, db, bcrypt, saltRounds, authFromCookie } = options;

	// SIGNUP (REGISTER)
	fastify.post("/", signupHandler(db, bcrypt, saltRounds, fastify));

	// SET2FA AT (REGISTER)
	fastify.patch("/2FA", buildSet2FAHandler(db, fastify));

	// GET STATS AND INFO
	fastify.get('/me', { preHandler: authFromCookie }, async (req, reply) => { // CHANGE WHEN WE HAVE THE FUNCTION
        
		const result = userInfo(req.user);

        LOGGER(result.status, "info.js", "/:user_id/info", result.msg);
        
		reply.code(result.status).send(result);
	});

    // /api/users/me (CHANGE INFO)
    fastify.patch('/me', { preHandler: authFromCookie }, async (req, reply) => {

    	const {display_name, username, email, old_password, new_password, avatar} = req.body;

		let result = null;
		if (display_name) {
			result = await changeDisplayName(userManager, db, req.user.id, display_name);
		}
		else if (username) {
			result = await changeUserName(userManager, db, req.user.id, username);
		}
		else if (email) {
			result = await changeEmail(db, req.user.id, email);
		}
		else if ((!old_password && new_password )|| (!new_password && old_password)) {
			return reply.code(400).send({msg: "Missing password field."});
		}
		else if (old_password && new_password) {
			result = await changePass(db, bcrypt, saltRounds, req.user.id, old_password, new_password);
		}
		else if (avatar) {
			result = await changeAvatar(userManager, db, req.user.id, avatar);
		}
		if (!result)
			return reply.code(400).send({ status: 400, msg: "Nothing to update." });
		return reply.code(result.status).send(result);
    });
}


