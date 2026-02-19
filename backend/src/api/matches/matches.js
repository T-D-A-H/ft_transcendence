const startMatch = require("./services/start.js");
const getMatchDetails = require("./services/details.js");
const joinMatch = require("./services/join.js");
const exitMatch = require("./services/exit.js");
const createMatch = require("./services/create.js");
const searchMatches = require("./services/search.js");
const sendMatchInvite = require("./services/invite.js");
const matchesRequests = require("./services/requests.js");
const respondMatchInvite = require("./services/respond.js");
const LOGGER = require("../../LOGGER.js");

module.exports = async function matchesRoutes(fastify, options) {

    const { userManager, authFromCookie} = options;

    // create match
    fastify.post('/', { preHandler: authFromCookie }, async (req, reply) => {

        let { visibility, type } = req.body;

        if (visibility === undefined) {
            visibility = false;
        }
    	if (type === undefined) {
    		return reply.code(400).send({ msg: "Missing type of match." });
    	}
    	const result = createMatch(userManager, req.user, visibility, type);

		LOGGER(result.status, "matchesRoutes.js", `POST/ type: ${type}, visibility: ${(visibility) ? "true" : "false"}`, result.msg);

    	reply.code(result.status).send(result);
    });


    // Get OPEN matches
    fastify.get('/', { preHandler: authFromCookie }, async (req, reply) => {

		//___________________________________________________________________________TESTING
		const createTestUsers = require("../../TESTING.js");
		const test_users = createTestUsers(userManager, 10);
		let i = 0;
		for (const usr of test_users) {
			if (i % 2 === 0) {
				const match = createMatch(userManager, usr, true, "online");
			}
			else {
				const match = createMatch(userManager, usr, false, "online");
				req.user.addPendingRequest("matches", match.id, usr.getId());
			}
			i++;
		}
		//___________________________________________________________________________TESTING

    	const result = searchMatches(userManager);

		LOGGER(result.status, "matchesHandler.js", `GET /`, result.msg);

    	reply.code(result.status).send(result);
    });


    // Get match details
    fastify.get('/current', { preHandler: authFromCookie }, async (req, reply) => {


    	const result = getMatchDetails(userManager, req.user);

		LOGGER(result.status, "matchRoutes.js", `GET /current`, result.msg);

    	reply.code(result.status).send(result);

    });

    // start a match
    fastify.post('/:match_id/start', { preHandler: authFromCookie }, async (req, reply) => {

	    const { match_id } = req.params;

    	const result = startMatch(userManager, req.user, match_id);

		LOGGER(result.status, "matchRoutes.js", `/${match_id}/start`, result.msg);

    	reply.code(result.status).send(result);

    });

    // join public match
    fastify.post('/:match_id/participants', { preHandler: authFromCookie }, async (req, reply) => {

	    const { match_id } = req.params;
        
    	const result = joinMatch(userManager, req.user, match_id, null);

		LOGGER(result.status, "matchPlayersRoutes.js", `POST /${match_id}/players`, result.msg);

    	reply.code(result.status).send(result);
    });

    // exit match
    fastify.delete('/:match_id/participants/me', { preHandler: authFromCookie }, async (req, reply) => {

	    const { match_id } = req.params;
        
    	const result = exitMatch(userManager, req.user, match_id);

		LOGGER(result.status, "matchPlayersRoutes.js", `DELETE /${match_id}/participants/me`, result.msg);

    	reply.code(result.status).send(result.msg);
    });

	 // invite to match
    fastify.post('/:match_id/invites', { preHandler: authFromCookie }, async (req, reply) => {

	    const { match_id } = req.params;
    	const { username, user_id } = req.body;

    	if (username === undefined && user_id === undefined) {

    		return reply.code(400).send({ msg: "Missing target username." });
    	}

    	const result = sendMatchInvite(userManager, req.user, match_id, username, user_id);

		LOGGER(result.status, "matchInviteRoutes.js", `POST /${match_id}/invite`, result.msg);

    	reply.code(result.status).send(result);
    });

	// get invite requests
    fastify.get('/invites', { preHandler: authFromCookie }, async (req, reply) => {


    	const result = matchesRequests(userManager, req.user);

		LOGGER(result.status, "matchInviteRoutes.js", `GET /invites`, result.msg);
    	reply.code(result.status).send(result);
    });

    // respond to match invite
    fastify.patch('/:match_id/invites/:user_id', { preHandler: authFromCookie }, async (req, reply) => {

	    const { match_id, user_id } = req.params;
    	const { accept } = req.body;

	    if (accept === undefined) {

	    	return reply.code(400).send({ msg: "Missing 'accept' field (true/false)." });
	    }

    	const result = respondMatchInvite(userManager, req.user, match_id, user_id, accept);

		LOGGER(result.status, "matchInviteRoutes.js", `PATCH /${match_id}/invites/${user_id}`, result.msg);

    	reply.code(result.status).send(result);
    });

    fastify.get('/history', { preHandler: authFromCookie }, async (req, reply) => {
        try {
			
            const history = await getMatchHistoryFromDB(userManager, req.user.id);
            
            return reply.send({ 
                status: 200, 
                msg: "History fetched", 
                target: history 
            });
        } catch (err) {
            console.error("Error fetching history:", err);
            return reply.code(500).send({ status: 500, msg: "Database error" });
        }
    });

}
