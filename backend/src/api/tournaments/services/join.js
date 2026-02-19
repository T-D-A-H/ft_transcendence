
module.exports = function joinTournament(userManager, user, tournamentId) {


	const tournament = userManager.getTournamentById(tournamentId);

	if (!tournament) {

		return { status: 400, msg: "Couldn't find tournament."};
	}
	else if (user.isInGame() === true) {

		if (user.getCurrentTournament() === tournament) {
			
			return { status: 400, msg: "You are already in this tournament." };
		}
		return { status: 400, msg: "You are already in a game/tournament." };
	}
	else if (!tournament.isPublic() && !user.hasPendingRequest("tournaments", tournamentId, userManager.getUserByID(tournament.getCreator()))) {

        return ({status: 404, msg: "Cannot join private match."});
    }
	else if (tournament.getIfTournamentFull()) {

		return { status: 404, msg: "Tournament already full." };
	}
	const added = userManager.addToTournament(user, tournament, user.getDisplayName());
	if (!added) {

		return { status: 500, msg: "Could not join tournament." };
	}
    
    tournament.broadcast("UPDATE", "tournaments");
	tournament.broadcast(userManager, "NOTIFICATION",`${user.getDisplayName()} joined the tournament. ${tournament.getCurrentSize()}/${tournament.getTournamentSize()}`, null, [user.getId()]);


	return { status: 200, msg: `Joined ${tournament.getCreatorAlias()}'s tournament.` };
}