const LOGGER = require("./LOGGER.js");

function sendInviteRequest(requestingUser, userManager, username_to_send) {

	if (requestingUser.getCurrentMatch() === null) {
		const match = userManager.createMatch(requestingUser, false, 3);
		requestingUser.setMatch(match);
	}
	const user_to_send = userManager.getUserByUsername(username_to_send);
	if (user_to_send !== null) {

		if (user_to_send.getIsConnected() === true) {
			
			requestingUser.addPendingRequest(user_to_send);
			//LOGGER(200, "server", "sendInviteRequest", requestingUser.getUsername() + " sent invite to play to " + username_to_send);
			requestingUser.send({type: "SEND_INVITE_RESPONSE", status: 200, msg: "sent invite to play with " + username_to_send, target: username_to_send});
			user_to_send.send({type: "INCOMING_INVITE_REQUEST", msg: requestingUser.getUsername() + " sent you an invite request.", target: requestingUser.getUsername()});
			return ;
		}
		//LOGGER(400, "server", "sendInviteRequest", username_to_send + " is not online.");
		requestingUser.send({type: "SEND_INVITE_RESPONSE", status: 400, msg: username_to_send + " is not online.", target: username_to_send});
		return ;
	}
	//LOGGER(400, "server", "sendInviteRequest", username_to_send + " doesnt exist.");
	requestingUser.send({type: "SEND_INVITE_RESPONSE", status: 400, msg: username_to_send + " doesnt exist.", target: username_to_send});
	return ;
}


function replyToInviteRequest(requestingUser, userManager, username_to_send) {

	const user_to_send = userManager.getUserByUsername(username_to_send);
	if (user_to_send === null) {
		//LOGGER(400, "server", "replyToInviteRequest", username_to_send + " couldnt find user.")
		requestingUser.send({type: "REPLY_INVITE_RESPONSE", status: 400, msg: username_to_send + " couldnt find user.", target: username_to_send});
		return ;
	}
	if (user_to_send.getIsConnected() === false) {
		//LOGGER(400, "server", "replyToInviteRequest", username_to_send + " is offline.")
		requestingUser.send({type: "REPLY_INVITE_RESPONSE", status: 400, msg: username_to_send + " is offline.", target: username_to_send});
		return ;
	}
	if (user_to_send.getIsPlaying() === true) {

		//LOGGER(400, "server", "replyToInviteRequest", username_to_send + " is already in a match.1")
		requestingUser.send({type: "REPLY_INVITE_RESPONSE", status: 400, msg: username_to_send + " is already in a match.", target: username_to_send});
		return ;
	}
	if (user_to_send.hasPendingRequest(requestingUser)) {

		if (userManager.addToMatch(requestingUser, user_to_send) === null) {
			//LOGGER(400, "server", "replyToInviteRequest", username_to_send + " is already in a match.2")
			requestingUser.send({type: "REPLY_INVITE_RESPONSE", status: 400, msg: username_to_send + " is already in a match.", target: username_to_send});
			return;
		}
		//LOGGER(200, "server", "replyToInviteRequest", "You accepted " + username_to_send + "'s invite.");
		requestingUser.send({type: "REPLY_INVITE_RESPONSE", status: 200, msg: "You accepted " + username_to_send + "'s invite.", target: username_to_send});
		user_to_send.send({type: "INCOMING_INVITE_RESPONSE", msg: requestingUser.getUsername() + " accepted your invite.", target: requestingUser.getUsername()});
		return ;
	}
	//LOGGER(400, "server", "acceptInviteRequest", "Unable to send your invite acceptance to " + user_to_send.getUsername());
	requestingUser.send({type: "REPLY_INVITE_RESPONSE", status: 400, msg: "Unable to send your invite acceptance to " + user_to_send.getUsername(), target: user_to_send.getUsername()});
}



function startMatchRequest(requestingUser) {

	//LOGGER(200, "server", "startMatchRequest", "Sent start match request");
	const match = requestingUser.getCurrentMatch();
	if (!match) {
		//LOGGER(400, "server", "startMatchRequest", "Not in a match.");
		user.send({type: "START_MATCH_RESPONSE", status: 400, msg: "You are not in a match.", target: requestingUser.getUsername()});
		return;
	}
	match.setReady(requestingUser);
	if (match.isReady[0] && match.isReady[1]) {
		match.players[0].send({type: "START_MATCH_RESPONSE", status: 200, msg: "Started match against " + match.players[1].getUsername(), target: match.players[1].getUsername()});
		match.players[1].send({type: "START_MATCH_RESPONSE", status: 200, msg: "Started match against " + match.players[0].getUsername(), target: match.players[0].getUsername()});
	}
}

function playLocalGame(requestingUser, userManager) {

	if (requestingUser.getIsConnected() === false) {
		//LOGGER(400, "server", "playLocalGame", "User is offline.")
		requestingUser.send({type: "PLAY_LOCALLY_RESPONSE", status: 400, msg: "You need to log in to be able to play.", target: ""});
		return ;
	}
	if (requestingUser.getIsPlaying() === true) {

		//LOGGER(400, "server", "playLocalGame", "User already in a match.")
		requestingUser.send({type: "PLAY_LOCALLY_RESPONSE", status: 400, msg: "You are already in another match.", target: ""});
		return ;
	}
	const match = userManager.createMatch(requestingUser, true, 3);
	requestingUser.setMatch(match);
	requestingUser.send({type: "PLAY_LOCALLY_RESPONSE", status: 200, msg: "Local Match created.", target: ""});
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
			replyToInviteRequest(user, userManager, msg.target);
		}
		else if (msg.type === "START_MATCH_REQUEST") {
			startMatchRequest(user);
		}
		else if (msg.type === "PLAY_LOCALLY_REQUEST") {
			playLocalGame(user, userManager);
		}
		else if (msg.type === "MOVE2" && user.currentMatch) {
			user.currentMatch.update2PlayerGame(user, msg.move);
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

    handleUserCommands(user, userManager);
  };
}

module.exports = buildGameSocketHandler;
