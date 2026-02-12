
const LOGGER = require("../../LOGGER.js");


async function tournamentsHandler(fastify, options) {

	const { userManager, authFromCookie } = options;

	// Create a tournament
    fastify.post('/', { preHandler: authFromCookie }, async (req, reply) => {

    	let { size, visibility } = req.body;

    	if (!size)
    		return reply.code(400).send({ msg: "Missing size." });
		if (!visibility)
			visibility = false;
    	const result = userManager.createTournamentRequest(req.user, size, visibility);
		LOGGER(result.status, "tournaments.js", "GET /", result.msg);
    	reply.code(result.status).send(result);
    });


	// Search / list tournaments
    fastify.get('/', { preHandler: authFromCookie }, async (req, reply) => {

    	const result = userManager.searchTournamentsRequest();
		LOGGER(result.status, "tournaments.js", "POST /", result.msg);
    	reply.code(result.status).send(result);
    });


	// Join a tournament
    fastify.post('/:tournament_id/join', { preHandler: authFromCookie }, async (req, reply) => {

		const { tournament_id } = req.params;

		const targetTournament = userManager.getTournamentById(tournament_id);
		if (!targetTournament) {
			return reply.code(404).send({ msg: "Tournament not found." });
		}
		if (targetTournament.isPublic() === false)
			return reply.code(404).send({ msg: "Tournament is private." });
    	const result = userManager.joinTournamentRequest(req.user, targetTournament);
		LOGGER(result.status, "tournaments.js", `/${tournament_id}/join`, result.msg);
    	reply.code(result.status).send(result);
    });

	// start tournament game
	fastify.post('/:tournament_id/matches/:match_id/start', { preHandler: authFromCookie }, async (req, reply) => {

		const { tournament_id, match_id } = req.params;

		const targetMatch = userManager.getMatchById(match_id);
		if (!targetMatch) {
			return reply.code(404).send({ msg: "Match not found." });
		}
		const targetTournament = userManager.getTournamentById(tournament_id);
		if (!targetTournament) {
			return reply.code(404).send({ msg: "Tournament not found." });
		}

		const result = userManager.startMatchRequest(req.user, targetMatch, targetTournament);
		LOGGER(result.status, "tournaments.js", `/${tournament_id}/matches/${match_id}/start`, result.msg);
		reply.code(result.status).send(result);
	});

	// exit tournament game
	fastify.post('/:tournament_id/matches/:match_id/exit', { preHandler: authFromCookie }, async (req, reply) => {

		const { tournament_id, match_id } = req.params;

		const targetMatch = userManager.getMatchById(match_id);
		if (!targetMatch) {
			return reply.code(404).send({ msg: "Match not found." });
		}
		const targetTournament = userManager.getTournamentById(tournament_id);
		if (!targetTournament) {
			return reply.code(404).send({ msg: "Tournament not found." });
		}

		const result = userManager.exitMatchRequest(req.user, targetMatch, targetTournament);
		LOGGER(result.status, "tournaments.js", `/${tournament_id}/matches/${match_id}/exit`, result.msg);
		reply.code(result.status).send(result.msg);
	});

	//invite to tournament
	fastify.post('/:tournament_id/invite', { preHandler: authFromCookie }, async (req, reply) => {

		const { tournament_id } = req.params;
    	const { username } = req.body;

    	if (!username) {
    		return reply.code(400).send({ msg: "Missing target username." });
    	}

        const targetTournament = userManager.getTournamentById(tournament_id);
	    if (!targetTournament) {
	    	return reply.code(404).send({ msg: "Tournament not found." });
	    }

    	const result = userManager.sendTournamentInvite(req.user, targetTournament, username);
		LOGGER(result.status, "tournaments.js", `/${tournament_id}/invite/`, result.msg);
    	reply.code(result.status).send(result);
    });

	// respond to tournament invite
    fastify.post('/:tournament_id/respond', { preHandler: authFromCookie }, async (req, reply) => {

	    const { tournament_id } = req.params;
    	const { accept } = req.body;

	    if (accept === undefined) {
	    	return reply.code(400).send({ msg: "Missing 'accept' field (true/false)." });
	    }

        const targetTournament = userManager.getTournamentById(tournament_id);
	    if (!targetTournament) {
	    	return reply.code(404).send({ msg: "Tournament not found." });
	    }

    	const result = userManager.respondTournamentInvite(req.user, targetTournament, accept);
		LOGGER(result.status, "tournaments.js", `/${tournament_id}/respond/`, result.msg);
    	reply.code(result.status).send(result.msg);
    });


}

module.exports = tournamentsHandler;