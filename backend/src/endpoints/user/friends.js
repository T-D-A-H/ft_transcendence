async function friendsHandler(fastify, options) {

	const { userManager, authFromCookie } = options;

    // create match
    fastify.get('/requests', { preHandler: authFromCookie }, async (req, reply) => {

		const targetUser = userManager.getUserById(req.params.user_id);

		if (!targetUser) {
			return reply.code(404).send({ msg: "NOT IMPLEMENTED YET" });
		}

        return reply.code(200).send({ msg: "NOT IMPLEMENTED YET" });
    });


    fastify.post('/requests', { preHandler: authFromCookie }, async (req, reply) => {

		const targetUser = userManager.getUserById(req.params.user_id);

		if (!targetUser) {
			return reply.code(404).send({ msg: "NOT IMPLEMENTED YET" });
		}

		return reply.code(200).send({ msg: "NOT IMPLEMENTED YET" });
    });


}


module.exports = friendsHandler;