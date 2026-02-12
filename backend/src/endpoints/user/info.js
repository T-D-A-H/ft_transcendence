const LOGGER = require("../../LOGGER.js");
const createTestUsers = require("../../TESTING.js");

async function infoHandler(fastify, options) {

	const { userManager, authFromCookie } = options;



	// API requests FOR matches
    fastify.get('/requests/matches', { preHandler: authFromCookie }, async (req, reply) => {
		//DESCOMENTAR PARA PROBAR
		// const fakeusers = createTestUsers(userManager, 12);
		// let i = 0;
		// for (const fake of fakeusers) {
		// 	req.user.addPendingRequest("match", "123" + i, fake.getId());
		// 	i++;
		// }
		const result = userManager.getRequests(req.user, "match");

        LOGGER(result.status, "info.js", "/requests/matches", result.msg);
		reply.code(result.status).send(result);

	});

	// API requests FOR tournaments
    fastify.get('/requests/tournaments', { preHandler: authFromCookie }, async (req, reply) => {
		//DESCOMENTAR PARA PROBAR
			// const fakeusers = createTestUsers(userManager, 12);
			// let i = 0;
			// for (const fake of fakeusers) {
			// 	req.user.addPendingRequest("tournament", "xyz" + i, fake.getId());
			// 	i++;
			// }

		const result = userManager.getRequests(req.user, "tournament");

        LOGGER(result.status, "info.js", "/requests/tournaments", result.msg);
		reply.code(result.status).send(result);

	});

    // API requests FOR friends (NOT IMPLEMENTED YET)
    fastify.get('/requests/friends', { preHandler: authFromCookie }, async (req, reply) => {
		//DESCOMENTAR PARA PROBAR
		// const fakeusers = createTestUsers(userManager, 12);
		// let i = 0;
		// for (const fake of fakeusers) {
		// 	req.user.addPendingRequest("friend", "123" + i, fake.getId());
		// 	i++;
		// }

		const result = userManager.getRequests(req.user, "friend");

        LOGGER(result.status, "info.js", "/requests/friends", result.msg);
		reply.code(result.status).send(result);

	});

    // API user profile info (name, displayname, id)
    fastify.get('/:user_id/info', { preHandler: authFromCookie }, async (req, reply) => {

        let targetUser = req.user;

        if (req.params.user_id !== "me") {

            targetUser = userManager.getUserById(req.params.user_id);

		    if (!targetUser) {
		    	return reply.code(404).send({ msg: "User not found." });
		    }
        }
		const result = userManager.userInfo(targetUser);
        LOGGER(result.status, "info.js", "/:user_id/info", result.msg);
		reply.code(result.status).send(result);
    });


    fastify.get('/:user_id/stats', { preHandler: authFromCookie }, async (req, reply) => {

		const targetUser = userManager.getUserById(req.params.user_id);

		if (!targetUser) {
			return reply.code(404).send({ msg: "User not found." });
		}

		const result = userManager.userStats(targetUser);
        LOGGER(result.status, "info.js", "/:user_id/stats", result.msg);
		reply.code(result.status).send(result);
    });
}


module.exports = infoHandler;