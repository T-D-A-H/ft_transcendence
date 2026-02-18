
module.exports = function exitTournament(userManager, user, tournamentId) {

    const tournament = userManager.getTournamentById(tournamentId);

    if (!tournament) {

        return { status: 400, msg: "Couldn't find tournament." };
    }
    else if (user.getCurrentTournament() === null) {

        return { status: 400, msg: "You are not in a tournament."};
    }
    else  if (tournament !== user.getCurrentTournament()) {

        return { status: 404, msg: "You are not in this tournament."};
    }
    userManager.disconnectUser(user);

    return { status: 200, msg: "Succesfully exited Tournament."};
}