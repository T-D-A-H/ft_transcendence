const LOGGER = require("../../LOGGER.js");

async function matchesHandler(fastify, options) {

	const { userManager, authFromCookie } = options;

    // create match
    fastify.post('/', { preHandler: authFromCookie }, async (req, reply) => {

        let { type, visibility } = req.body;
    	if (!type) {
    		return reply.code(400).send({ msg: "Missing type of match." });
    	}
		if (!visibility) {
    		visibility = false;
    	}
    	const result = userManager.createMatchRequest(req.user, type, visibility);
		LOGGER(result.status, "matches.js", `POST/ type: ${type}, visibility: ${(visibility) ? "true" : "false"}`, result.msg);
    	reply.code(result.status).send(result);
    });

	// invite to match
    fastify.post('/:match_id/invite', { preHandler: authFromCookie }, async (req, reply) => {

	    const { match_id } = req.params;
    	const { username } = req.body;

    	if (!username) {
    		return reply.code(400).send({ msg: "Missing target username." });
    	}

        const targetMatch = userManager.getMatchById(match_id);
	    if (!targetMatch) {
	    	return reply.code(404).send({ msg: "Match not found." });
	    }
    	const result = userManager.sendMatchInviteRequest(req.user, targetMatch, username);
		LOGGER(result.status, "matches.js", `/${match_id}/invite`, result.msg);
    	reply.code(result.status).send(result);
    });

    // invite to match
    fastify.post('/:match_id/respond', { preHandler: authFromCookie }, async (req, reply) => {

	    const { match_id } = req.params;
    	const { accept } = req.body;

	    if (accept === undefined) {
	    	return reply.code(400).send({ msg: "Missing 'accept' field (true/false)." });
	    }

        const targetMatch = userManager.getMatchById(match_id);
	    if (!targetMatch) {
	    	return reply.code(404).send({ msg: "Match not found." });
	    }

    	const result = userManager.respondMatchInviteRequest(req.user, targetMatch, accept);
		LOGGER(result.status, "matches.js", `/${match_id}/respond`, result.msg);
    	reply.code(result.status).send(result);
    });

    // start to match
    fastify.post('/:match_id/start', { preHandler: authFromCookie }, async (req, reply) => {

	    const { match_id } = req.params;

        const targetMatch = userManager.getMatchById(match_id);
	    if (!targetMatch) {
	    	return reply.code(404).send({ msg: "Match not found." });
	    }

    	const result = userManager.startMatchRequest(req.user, targetMatch, null);
		LOGGER(result.status, "matches.js", `/${match_id}/start`, result.msg);
    	reply.code(result.status).send(result);
    });

    // exit to match
    fastify.post('/:match_id/exit', { preHandler: authFromCookie }, async (req, reply) => {

	    const { match_id } = req.params;

        const targetMatch = userManager.getMatchById(match_id);
	    if (!targetMatch) {
	    	return reply.code(404).send({ msg: "Match not found." });
	    }

    	const result = userManager.exitMatchRequest(req.user, targetMatch, null);
		LOGGER(result.status, "matches.js", `/${match_id}/exit`, result.msg);
    	reply.code(result.status).send(result.msg);
    });
}

module.exports = matchesHandler;