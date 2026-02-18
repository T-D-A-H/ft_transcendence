

module.exports = function sendTournamentInvite(userManager, user, tournamentId, targetUsername, targetUserId) {

    const tournament = userManager.getTournamentById(tournamentId);

	if (!tournament) {

		return ({status: 400, msg: "Tournament not found." });
	}
    else if (tournament !== user.getCurrentTournament()) {

        return ({ status: 404, msg: "You are not part of this tournament." });
    }
    let targetUser;

    if (targetUsername !== undefined) {

        targetUser = userManager.getUserByUsername(targetUsername);
    }
    else if (targetUserId !== undefined) {

        targetUser = userManager.getUserById(targetUserId);
    }
	if (targetUser === null) {

        return ({ status: 400, msg: `Couldn't find user`});
	}
	else if (targetUser.getIsConnected() === false) {

        return { status: 400, msg: targetUser.getUsername() + " is not online." };
	}
    
	targetUser.addPendingRequest("tournament", tournamentId, user.getId());

	targetUser.notify("REQUEST", `${user.getUsername()} sent you an invite request.`, {type: "tournaments", id: tournamentId});

    return { status: 200, msg: `Sent invite to play with ${targetUsername}`};
}
