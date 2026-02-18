module.exports = function searchTournaments(userManager) {

    const available_tournaments = [];

	for (const tournament of userManager.tournaments.values()) {

        if (tournament.isPublic()) {

            available_tournaments.push({

			    id: tournament.getId(),
			    creator: tournament.getCreatorAlias(),
			    max_size: tournament.getTournamentSize(),
			    current_size: tournament.getCurrentSize(),
                full: tournament.isWaitingAndFull()
		    });
        }
	}

    if (available_tournaments.length === 0) {

        return { status: 400, msg: "Found No tournaments.", target: {creator: "Couldnt find any games."} };
    }
	return { status: 200, msg: "Found Open Tournaments.", target: available_tournaments };
}