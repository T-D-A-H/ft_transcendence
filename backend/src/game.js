const LOGGER = require("./LOGGER.js");

function sendInviteRequest(requestingUser, userManager, username_to_send) {

	if (requestingUser.getCurrentMatch() === null) {
		userManager.createMatch(requestingUser, false, null);
	}
	const user_to_send = userManager.getUserByUsername(username_to_send);
	if (user_to_send === null) {
		//LOGGER(400, "server", "sendInviteRequest", username_to_send + " doesnt exist.");
		requestingUser.send({type: "SEND_INVITE_RESPONSE", status: 400, msg: username_to_send + " is either not online or doesnt exist.", target: username_to_send});
	}
	else if (user_to_send.getIsConnected() === false) {
		//LOGGER(400, "server", "sendInviteRequest", username_to_send + " is not online.");
		requestingUser.send({type: "SEND_INVITE_RESPONSE", status: 400, msg: username_to_send + " is not online.", target: username_to_send});
	}
	else {
		//LOGGER(200, "server", "sendInviteRequest", requestingUser.getUsername() + " sent invite to play to " + username_to_send);
		user_to_send.addPendingRequest(requestingUser, requestingUser.getUsername());
		requestingUser.send({type: "SEND_INVITE_RESPONSE", status: 200, msg: "Sent invite to play with " + username_to_send, target: username_to_send});
		user_to_send.send({type: "INCOMING_INVITE_REQUEST", msg: requestingUser.getUsername() + " sent you an invite request.", target: requestingUser.getUsername()});
	}
}

function replyToInviteRequest(requestingUser, userManager, username_to_send, acceptance) {

	if (requestingUser.hasPendingRequest(username_to_send) === false) {
		requestingUser.send({type: "REPLY_INVITE_RESPONSE", status: 400, msg: "Couldnt find user in list.", target: null});
		return ;
	}
	const user_to_send = userManager.getUserByUsername(username_to_send);
	if (user_to_send === null) {
		//LOGGER(400, "server", "replyToInviteRequest", username_to_send + " couldnt find user.");
		requestingUser.send({type: "REPLY_INVITE_RESPONSE", status: 307, msg: username_to_send + " couldnt find user.", target: user_to_send.getDisplayName()});
		requestingUser.removePendingRequest(username_to_send);
		return ;
	}
	if (acceptance === "decline") {
		user_to_send.send({type: "INCOMING_INVITE_RESPONSE", status: 400, msg: requestingUser.getUsername() + " declined your invite.", target: requestingUser.getUsername()});
		requestingUser.send({type: "REPLY_INVITE_RESPONSE", status: 307, msg: "You declined " + username_to_send + "'s invite.", target: user_to_send.getDisplayName()});
		requestingUser.removePendingRequest(username_to_send);
		return ;
	}
	if (user_to_send.getIsConnected() === false) {
		//LOGGER(400, "server", "replyToInviteRequest", username_to_send + " is offline.")
		requestingUser.send({type: "REPLY_INVITE_RESPONSE", status: 307, msg: username_to_send + " is offline.", target: username_to_send});
		requestingUser.removePendingRequest(username_to_send);
		return ;
	}
	if (user_to_send.getIsPlaying() === true || user_to_send.getCurrentTournament() !== null) {

		//LOGGER(400, "server", "replyToInviteRequest", username_to_send + " is already in a match.")
		requestingUser.send({type: "REPLY_INVITE_RESPONSE", status: 400, msg: username_to_send + " is currently in a match. Try Later.", target: user_to_send.getDisplayName()});
		return;
	}
	//LOGGER(200, "server", "replyToInviteRequest", "You accepted " + username_to_send + "'s invite.");
	userManager.addToMatch(requestingUser, user_to_send.getCurrentMatch());
	requestingUser.send({type: "REPLY_INVITE_RESPONSE", status: 200, msg: "You accepted " + username_to_send + "'s invite.", target: user_to_send.getDisplayName()});
	user_to_send.send({type: "INCOMING_INVITE_RESPONSE", status: 200, msg: requestingUser.getUsername() + " accepted your invite.", target: requestingUser.getDisplayName()});
	requestingUser.removePendingRequest(username_to_send);


}

function startMatchRequest(requestingUser, userManager) {

	//LOGGER(200, "server", "startMatchRequest", "Sent start match request");

	const match = requestingUser.getCurrentMatch();
	if (!match) {
		//LOGGER(400, "server", "startMatchRequest", "Not in a match.");
		requestingUser.send({type: "START_MATCH_RESPONSE", status: 400, msg: "You are not in a match.", target: requestingUser.getDisplaySide()});
		return;
	}
	match.setReady(requestingUser);
	if (match.isReady[0] && match.isReady[1]) {


		match.players[0].send({type: "START_MATCH_RESPONSE", status: 200, msg: "Started match against " + match.players[1].getUsername(), target: match.getPlayerSides(match.players[0])});
		match.players[1].send({type: "START_MATCH_RESPONSE", status: 200, msg: "Started match against " + match.players[0].getUsername(), target: match.getPlayerSides(match.players[1])});
	}
}

function playLocalGame(requestingUser, userManager) {

	if (requestingUser.getIsConnected() === false) {

		//LOGGER(400, "server", "playLocalGame", "User is offline.")
		requestingUser.send({type: "PLAY_LOCALLY_RESPONSE", status: 400, msg: "You need to log in to be able to play.", target: ""});
	}
	else if (requestingUser.getCurrentMatch() !== null) {

		//LOGGER(400, "server", "playLocalGame", "User already in a match.")
		requestingUser.send({type: "PLAY_LOCALLY_RESPONSE", status: 400, msg: "You are already in another match.", target: ""});
	}
	else if (requestingUser.getCurrentTournament() !== null) {
		//LOGGER(400, "server", "playLocalGame", "User already in a tournament.")
		requestingUser.send({type: "PLAY_LOCALLY_RESPONSE", status: 400, msg: "You are already in another tournament.", target: ""});
	}
	else {

		userManager.createMatch(requestingUser, true, null);
		requestingUser.send({type: "PLAY_LOCALLY_RESPONSE", status: 200, msg: "Local Match created.", target: ""});
	}
}

function createTournamentRequest(requestingUser, userManager, userAlias, tournamentSize) {

	//LOGGER(200, "UserManager", "createTournamentRequest", tournamentSize);
	const size = Number(tournamentSize);
	if (requestingUser.getCurrentTournament() !== null) {

		requestingUser.send({type: "CREATE_TOURNAMENT_RESPONSE", status: 400, msg: "You are already in a tournament."});
	}
	else if (requestingUser.getCurrentMatch() !== null) {

		requestingUser.send({type: "CREATE_TOURNAMENT_RESPONSE", status: 400, msg: "You are already in a match."});
	}
	else if (size < 2 || size > 64 || size % 2 != 0) {
		requestingUser.send({type: "CREATE_TOURNAMENT_RESPONSE", status: 400, msg: "Tournament sizes should be even numbers (2-64)"});
	}
	else {

		userManager.createTournament(requestingUser, userAlias, size);
		requestingUser.send({type: "CREATE_TOURNAMENT_RESPONSE", status: 200, msg: "Tournament created!"});
	}
}

function searchTournamentRequest(requestingUser, userManager) {

	const available_tournaments = userManager.getAvailableTournaments();
	if (available_tournaments === null) {

		requestingUser.send({type: "SEARCH_TOURNAMENT_RESPONSE", status: 400, msg: "No tournaments found.", target: []});
	}
	else {

		requestingUser.send({type: "SEARCH_TOURNAMENT_RESPONSE", status: 200, msg: "Found tournaments.", target: available_tournaments});
	}
}

function joinTournamentRequest(requestingUser, userManager, tournament_id, alias = null) {//LOGGER(200, "server", "joinTournamentRequest", "called");

	if (requestingUser.getCurrentTournament() !== null) {

		requestingUser.send({type: "JOIN_TOURNAMENT_RESPONSE", status: 400, msg: "You are already in a tournament."});
		return;
	}
	else if (requestingUser.getCurrentMatch() !== null) {

		requestingUser.send({type: "JOIN_TOURNAMENT_RESPONSE", status: 400, msg: "You are already in a match."});
		return;
	}

	const tournament = userManager.getTournamentById(tournament_id);

	if (tournament === null) {
		//LOGGER(400, "server", "joinTournamentRequest", "tournament NOT found");
		requestingUser.send({type: "JOIN_TOURNAMENT_RESPONSE", status: 400, msg: "Couldnt find tournament."});
		return;
	}

	else if (tournament.getIfTournamentFull()) {

		requestingUser.send({type: "JOIN_TOURNAMENT_RESPONSE", status: 400, msg: "Tournament already full."});
	}
	else {

		//LOGGER(200, "server", "joinTournamentRequest", "tournament found: " + 
		// 	"\nid: " + tournament.getTournamentId() + 
		// 	"\ncreator: " + tournament.getCreatorAlias() + 
		// 	"\ncurrent_size: " + tournament.getCurrentSize() + 
		// 	"\nmax_size: " + tournament.getTournamentSize()
		// );

		if (userManager.addToTournament(requestingUser, tournament, alias) === false) {
			requestingUser.send({type: "JOIN_TOURNAMENT_RESPONSE", status: 400, msg: "Couldnt find tournament."});
			return ;
		}
		requestingUser.send({type: "JOIN_TOURNAMENT_RESPONSE", status: 200, msg: "Joined " + tournament.getCreatorAlias() +  "'s tournament."});
	}
}

function exitMatchRequest(requestingUser, userManager) {

	const match = requestingUser.getCurrentMatch();
	const tournament = requestingUser.getCurrentTournament();

	if (match === null && tournament === null) {
		requestingUser.send({type: "EXIT_MATCH_RESPONSE", status: 400, msg: "You are not in a match.", target: requestingUser.getUsername()});
		return;
	}
	const other_user = (requestingUser === match.players[0]) ? 1 : 0;

	match.setWINNER(other_user);
    match.setLOSER(1 - other_user);
	match.setDisconnect();

    if (tournament) {
        userManager.tournamentDisconnect(tournament);
        tournament.removeUserFromTournament(requestingUser);
    }
	requestingUser.send({type: "EXIT_MATCH_RESPONSE", status: 200, msg: "Succesfully exited match.", target: requestingUser.getUsername()});
}

function getInfoRequest(requestingUser, userManager, target) {

	// const userName = requestingUser.getUsername();
	// if (target !== userName) {

	// 	const user = userManager.getUserByUsername(userName);
	// 	requestingUser.send({type: "INFO_RESPONSE", status: 200, msg: "", target: {
	// 		display_name: user.getDisplayName(),
	// 		username: userName
	// 	}});
	// }
	// else if (target === userName) {

		requestingUser.send({type: "INFO_RESPONSE", status: 200, msg: "", target: {
			display_name: requestingUser.getDisplayName(),
			username: requestingUser.getUsername()
		}});
	// }
	// else {
	// 	requestingUser.send({type: "INFO_RESPONSE", status: 400, msg: "Couldnt get username/display name", target: null});
	// }
}

function getPendingRequest(requestingUser) {


	const request_list = requestingUser.listPendingRequests();
	if (request_list === null) {
		requestingUser.send({type: "GET_PENDING_RESPONSE", status: 400, msg: "You have no pending requests.", target: null});
		return ;
	}
	requestingUser.send({type: "GET_PENDING_RESPONSE", status: 200, msg: "Pending request list updated.", target: request_list});
}


function handleUserCommands(user, userManager) {

	user.socket.on("message", (raw) => {

	    let msg;
	    try {
		    msg = JSON.parse(raw);
	    } catch (err) {
			//LOGGER(500, "server", "handleUserCommands", "invalid json");
		    return ;
	    }
		if (msg.type === "SEND_INVITE_REQUEST") {
			sendInviteRequest(user, userManager, msg.target);
		}
		else if (msg.type === "REPLY_INVITE_REQUEST") {
			replyToInviteRequest(user, userManager, msg.target, msg.target2);
		}
		else if (msg.type === "START_MATCH_REQUEST") {
			startMatchRequest(user, userManager);
		}
		else if (msg.type === "EXIT_MATCH_REQUEST") {
			exitMatchRequest(user);
		}
		else if (msg.type === "PLAY_LOCALLY_REQUEST") {
			playLocalGame(user, userManager);
		}
		else if (msg.type === "CREATE_TOURNAMENT_REQUEST") {
			createTournamentRequest(user, userManager, msg.target, msg.target2);
		}
		else if (msg.type === "SEARCH_TOURNAMENT_REQUEST") {
			searchTournamentRequest(user, userManager);
		}
		else if (msg.type === "JOIN_TOURNAMENT_REQUEST") {
			joinTournamentRequest(user, userManager, msg.target, msg.target2);
		}
		else if (msg.type === "INFO_REQUEST") {
			getInfoRequest(user, userManager, msg.target);
		}
		else if (msg.type === "GET_PENDING_REQUEST") {
			getPendingRequest(user);
		}
		else if (msg.type === "MOVE2" && user.currentMatch) {

			user.currentMatch.update2PlayerGame(msg.move);
		}
		else if (msg.type === "MOVE" && user.currentMatch) {
			user.currentMatch.updateGame(user, msg.move);
		}
	});

}

function buildGameSocketHandler(userManager, fastify) {

  return (conn, req) => {

    const token = req.query.token;
    if (!token || token === "null") {
		//LOGGER(400, "server", "buildGameSocketHandler", "couldnt get token");
		return conn.socket.close(1008);
	}

    let payload;
    try {
		payload = fastify.jwt.verify(token);
    } catch {
		//LOGGER(400, "server", "buildGameSocketHandler", "jwt.verify failed");
		return conn.socket.close(1008);
    }

    const user = userManager.getUserByID(payload.id);
    if (!user) {
		//LOGGER(500, "server", "buildGameSocketHandler", "couldnt find user");
		return conn.socket.close(1008);
	}

    user.connect(conn.socket);

	//TESTING
	// const {createTestUsers} = require("./TESTING.js");
	// const users = createTestUsers(userManager, 24);
	// for (const u of users) {
	// 	user.addPendingRequest(u, u.username);
	// }

    handleUserCommands(user, userManager);
  };
}

module.exports = buildGameSocketHandler;
