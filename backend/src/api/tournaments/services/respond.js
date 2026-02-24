
module.exports = function respondTournamentInvite(userManager, user, tournamentId, selfId, accept) {

    const tournament = userManager.getTournamentById(tournamentId);

    if (!tournament) {

        return ({status: 400, msg: "Couldn't find tournament."});
    }
    else if (user.getId() != selfId) {

        return ({ status: 404, msg: "Cannot respond someone elses invite." });
    }
    const creatorId = tournament.getCreator();
    if (!creatorId) {

        return ({ status: 500, msg: "Couldn't find tournament creator." });
    }
    const creator = userManager.getUserByID(creatorId);
    if (!creator) {

        return ({ status: 500, msg: "Couldn't find tournament creator." });
    }
    if (!user.hasPendingRequest("tournaments", tournamentId, creatorId)) {

        return ({status: 404, msg: "Couldn't find tournament in pending requests."});
    }
    else if (accept === false) {

    	creator.notify("NOTIFICATION", `${user.getUsername()} declined your invite.`);
    	user.removePendingRequest("tournaments", tournamentId, creatorId);

        return { status: 404, msg: `You declined ${creator.getUsername()}'s invite.`};
    }
    else if (creator.getIsConnected() === false) {

        user.removePendingRequest("tournaments", tournamentId, creatorId);
        return { status: 404, msg: `${creator.getUsername()} is not online.`};
    }
    else if (creator.getIsPlaying() === true) {

        return { status: 201, msg: `${creator.getUsername()} is currently in a game. Try again later.`};
    }
    else {

        userManager.addToTournament(user, tournament, user.getDisplayName());

        user.removePendingRequest("tournaments", tournamentId, creatorId);

        creator.notify("NOTIFICATION", `${user.getUsername()} accepted your tournament invite.`);

        let ids = tournament.getPlayers();
        for (const id of ids.keys()) {
            const userX = userManager.getUserByID(id);
            userX.notify("NOTIFICATION", `${user.getUsername()} joined the tournament`)
            userX.notify("UPDATE", "tournaments");
        }
    }
    return {status: 200, msg: `You accepted ${targetUser.getUsername()}'s tournament invite.`};
}

