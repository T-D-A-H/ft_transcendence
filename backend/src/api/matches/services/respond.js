
module.exports = function respondMatchInvite(userManager, user, matchId, selfId, accept) {

    const match = userManager.getMatchById(matchId);

    if (!match) {
        return ({status: 400, msg: "Couldn't find match."});
    }
    else if (user.getId() != selfId) {

        return ({ status: 404, msg: "Cannot respond someone elses invite." });
    }
    const creator = match.getCreatorUser();
    if (!creator) {
        return ({ status: 500, msg: "Couldn't find match creator." });
    }
    const creatorId = creator.getId();
    if (!user.hasPendingRequest("matches", matchId, creatorId)) {

        return ({status: 404, msg: "Couldn't find match in pending requests."});
    }
    if (accept === false) {

    	creator.notify("NOTIFICATION", `${user.getUsername()} declined your invite.`);
    	user.removePendingRequest("matches", matchId, creatorId);

        return { status: 200, msg: `You declined ${creator.getUsername()}'s invite.`};
    }
    else if (creator.getIsConnected() === false) {

        user.removePendingRequest("matches", matchId, creatorId);
        return { status: 404, msg: `${creator.getUsername()} is not online.`};
    }
    else if (creator.getIsPlaying() === true) {

        return { status: 201, msg: `${creator.getUsername()} is currently in a game. Try again later.`};
    }
    else {

        userManager.addToMatch(user, match);

        user.removePendingRequest("matches", matchId, creatorId);

        creator.notify("NOTIFICATION", `${user.getUsername()} accepted your match invite.`);

        match.broadcast("UPDATE", "matches");
    }
    return {status: 200, msg: `You accepted ${creator.getUsername()}'s match invite.`};
}

