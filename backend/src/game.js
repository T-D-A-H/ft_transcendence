const LOGGER = require("./LOGGER.js");

function joinMatchRequest(requestingUser, userManager, target_username) {

	const match = userManager.addToMatch(requestingUser, target_username);
	if (match === null) {
		requestingUser.send({ type: "JOIN_MATCH_RESPONSE", status: 409, target: null });
		LOGGER(409, "joinMatchRequest: ", "Match is already full");
		return ;
	}
	requestingUser.send({ type: "JOIN_MATCH_RESPONSE", status: 200, target: match.players[0].getUsername()});
	LOGGER(200, "joinMatchRequest: ", "Match found for: " + match.players[1].getUsername() + " against " + match.players[0].getUsername());
}

function searchMatchRequest(requestingUser, userManager) {

	const waiting_matches = userManager.getMatches("waiting");

	const matches_names = [];
	for (const match of waiting_matches) {
		matches_names.push(match.players[0].getUsername());
	}
	if (matches_names.length === 0) {
		LOGGER(409, "searchMatchRequest: ", "No available matches found");
		requestingUser.send({ type: "SEARCH_MATCH_RESPONSE", status: 409});
		return ;
	}
	requestingUser.send({ type: "SEARCH_MATCH_RESPONSE", status: 200, matches: matches_names});
	LOGGER(200, "searchMatchRequest: ", "Sent available matches");
}

function createMatchRequest(requestingUser, userManager) {

	if (userManager.findMatch(requestingUser) !== null) {
		LOGGER(409, "createMatchRequest: ", "Already in a match.");
		requestingUser.send({ type: "CREATE_MATCH_RESPONSE", status: 409, msg: "Already in a match." });
		return ;
	}
	userManager.createMatch(requestingUser);
	requestingUser.send({ type: "CREATE_MATCH_RESPONSE", status: 200, msg: "Match created."});
	LOGGER(200, "createMatchRequest: ", "Sent Match created.");
}

function handleUserCommands(user, userManager) {
	user.socket.on("message", (raw) => {
		let msg;
		try {
			msg = JSON.parse(raw);
		} catch (err) {
			LOGGER("handleUserCommands: invalid json", 500);
			return;
		}

		if (msg.type === "CREATE_MATCH_REQUEST") {
			createMatchRequest(user, userManager);
		}
		else if (msg.type === "SEARCH_MATCH_REQUEST") {
			searchMatchRequest(user, userManager);
		}
		else if (msg.type === "JOIN_MATCH_REQUEST") {
			joinMatchRequest(user, userManager, msg.target);
		}
		else if (msg.type === "READY_TO_JOIN") {
			LOGGER(200, "playerJoinedMatch: ", "Sent match join");
			if (user.currentMatch.players[0] === user) {
				user.currentMatch.isReady[0] = true;
			}
			else if (user.currentMatch.players[1] === user) {
				user.currentMatch.isReady[1] = true;
			}
			user.send({ type: "PLAYER_JOINED_MATCH"});
		}
		else if (msg.type === "MOVE" && user.currentMatch) {
			user.currentMatch.setPlayerMove(user, msg.move);
		}
	});
}

// ✅ ACTUALIZADO: Ahora recibe userId del backend en lugar de token en URL
function buildGameSocketHandler(userManager, fastify) {
	return (conn, req, userId) => {
		// El userId ya fue verificado en main.js
		// No necesitamos validar el token aquí
		
		if (!userId) {
			LOGGER(400, "buildGameSocketHandler:", "No userId provided");
			return conn.socket.close(1008, "No user ID");
		}

		const user = userManager.getUser(userId);
		if (!user) {
			LOGGER(400, "buildGameSocketHandler:", "Could not find user with ID: " + userId);
			return conn.socket.close(1008, "User not found");
		}

		LOGGER(200, "buildGameSocketHandler:", "User connected: " + user.getUsername());
		
		user.connect(conn.socket);
		handleUserCommands(user, userManager);
	};
}

module.exports = buildGameSocketHandler;
