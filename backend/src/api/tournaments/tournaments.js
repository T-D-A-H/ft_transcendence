const createTournament = require("./services/create.js");
const searchTournaments = require("./services/search.js");
const sendTournamentInvite = require("./services/invite.js");
const tournamentsRequests = require("./services/requests.js");
const respondTournamentInvite = require("./services/respond.js");
const joinTournament = require("./services/join.js");
const exitTournament = require("./services/exit.js");
const startTournamentMatch = require("./services/start.js");
const getTournamentDetails = require("./services/details.js");
const LOGGER = require('../../LOGGER.js');

module.exports = async function tournamentsRoutes(fastify, options) {


	const { userManager, authFromCookie } = options;

	// Create a tournament
    fastify.post('/', { preHandler: authFromCookie }, async (req, reply) => {

    	let { size, visibility } = req.body;

    	if (!size) {
            
    		return reply.code(400).send({ msg: "Missing size." });
        }
		if (!visibility) {

			visibility = false;
        }

    	const result = await createTournament(userManager, req.user, size, visibility);

		LOGGER(result.status, "tournamentsCollectionsRoutes.js", "POST /", result.msg);

    	reply.code(result.status).send(result);
    });


	// Search / list tournaments
    fastify.get('/', { preHandler: authFromCookie }, async (req, reply) => {

    	const result = searchTournaments(userManager);

		LOGGER(result.status, "tournamentsCollectionsRoutes.js", "GET /", result.msg);
        
    	reply.code(result.status).send(result);
    });

	// invite to tournament
    fastify.post('/:tournament_id/invites', { preHandler: authFromCookie }, async (req, reply) => {

	    const { tournament_id } = req.params;
    	const { username, user_id } = req.body;

    	if (username === undefined && user_id === undefined) {

    		return reply.code(400).send({ msg: "Missing target username." });
    	}

    	const result = sendTournamentInvite(userManager, req.user, tournament_id, username, user_id);

		LOGGER(result.status, "tournamentsInvitesRoutes.js", `POST /${tournament_id}/invites`, result.msg);

    	reply.code(result.status).send(result);
    });

	// get tournament invite requests
    fastify.get('/invites', { preHandler: authFromCookie }, async (req, reply) => {


    	const result = tournamentsRequests(userManager, req.user);

		LOGGER(result.status, "tournamentsInvitesRoutes.js", `GET /invites`, result.msg);
    	reply.code(result.status).send(result);
    });

    // respond to tournament invite
    fastify.patch('/:tournament_id/invites/:user_id', { preHandler: authFromCookie }, async (req, reply) => {

	    const { tournament_id, user_id } = req.params;
    	const { accept } = req.body;

	    if (accept === undefined) {

	    	return reply.code(400).send({ msg: "Missing 'accept' field (true/false)." });
	    }

    	const result = respondTournamentInvite(userManager, req.user, tournament_id, user_id, accept);

		LOGGER(result.status, "tournamentsInvitesRoutes.js", `PATCH /${tournament_id}/invites/${user_id}`, result.msg);

    	reply.code(result.status).send(result);
    });


    // join public tournament
    fastify.post('/:tournament_id/participants', { preHandler: authFromCookie }, async (req, reply) => {

	    const { tournament_id } = req.params;
        
    	const result = joinTournament(userManager, req.user, tournament_id);

		LOGGER(result.status, "tournamentsParticipantsRoutes.js", `POST /${tournament_id}/participants`, result.msg);

    	reply.code(result.status).send(result);
    });

    // exit tournament
    fastify.delete('/:tournament_id/participants/me', { preHandler: authFromCookie }, async (req, reply) => {

	    const { tournament_id } = req.params;
        
    	const result = exitTournament(userManager, req.user, tournament_id);

		LOGGER(result.status, "tournamentsParticipantsRoutes.js", `DELETE /${tournament_id}/participants/me`, result.msg);

    	reply.code(result.status).send(result.msg);
    });

 	// Get match details
    fastify.get('/current', { preHandler: authFromCookie }, async (req, reply) => {

    	const result = getTournamentDetails(userManager, req.user);

		LOGGER(result.status, "tournamentsRoutes.js", `GET /current`, result.msg);

    	reply.code(result.status).send(result);

    });


    // start tournament game
	fastify.post('/:tournament_id/matches/:match_id/start', { preHandler: authFromCookie }, async (req, reply) => {

		const { tournament_id, match_id } = req.params;

    	const result = startTournamentMatch(userManager, req.user, tournament_id, match_id);

		LOGGER(result.status, "tournamentRoutes.js", `/${tournament_id}/matches/${match_id}start`, result.msg);

    	reply.code(result.status).send(result);
	});
}