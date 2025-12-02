

function searchRequest(userManager, requestingUser) {
	const connectedUsers = userManager.getConnectedUsers();

	if (requestingUser && requestingUser.currentMatch !== null) {
    	requestingUser.send({ type: "SEARCH_RESPONSE", status: 409, error: "Already in a match" });
   		return null;
 	
	}

	const freeUsers = connectedUsers.filter(u => u.currentMatch === null);

	if (freeUsers.length >= 2) {
		const [user1, user2] = freeUsers.slice(0, 2);
		const match = userManager.createMatch(user1, user2);
		match.broadcast({ type: "SEARCH_RESPONSE", status: 200 });
		return match;
	}

	if (requestingUser && requestingUser.isConnected) {
		requestingUser.send({ type: "SEARCH_RESPONSE", status: 400 });
	}
	return null;
}

function handleUserCommands(user, userManager) {

	user.socket.on("message", (raw) => {

	    let msg;
	    try {
		    msg = JSON.parse(raw);
	    } catch (err) {
		    console.error("Invalid JSON:", raw);
		    return ;
	    }

        if (msg.type === "SEARCH_REQUEST") {
			console.log("Search requested");
			searchRequest(userManager);
		}
		else if (msg.type === "MOVE" && user.currentMatch) {
			console.log("move recv: " + msg.move);
			user.currentMatch.setPlayerMove(user, msg.move);
		}
	});

}

function buildGameSocketHandler(userManager, fastify) {

  return (conn, req) => {

    const token = req.query.token;
    if (!token || token === "null")
      return conn.socket.close(1008);

    let payload;
    try {
		payload = fastify.jwt.verify(token);
    } catch {
		return conn.socket.close(1008);
    }

    const user = userManager.getUser(payload.id);
    if (!user)
		return conn.socket.close(1008);

    user.connect(conn.socket);
    handleUserCommands(user, userManager);
  };
}

module.exports = buildGameSocketHandler;

