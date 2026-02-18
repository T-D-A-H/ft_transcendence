module.exports = function startTournamentMatch(userManager, user, tournamentId, matchId) {

    const tournament = userManager.getTournamentById(tournamentId);
    const match = userManager.getMatchById(matchId);

    if (!tournament) {

        return ({status: 400, msg: "Couldn't find tournament."});
    }
    else if (!match) {

        return ({status: 400, msg: "Couldn't find tournament match."});
    }
    else if (user.getCurrentTournament() !== tournament) {

        return { status: 404, msg: "You are not in a tournament."};
    }
    else if (user.getCurrentMatch() !== match) {

        return { status: 404, msg: "You are not in a tournament match."};
    }

	match.setReady(user);

    return { status: 200, msg: "Succesfully started tournament match."};
}