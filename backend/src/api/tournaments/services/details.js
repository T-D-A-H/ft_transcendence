
module.exports = function getTournamentDetails(userManager, user) {

    const tournament = user.getCurrentTournament();

    if (!tournament) {

        if (user.getCurrentMatch() !== null)
            return ({status: 302, msg: "Fetch matches.", target: "matches"});
        return ({status: 400, msg: "You are not in a tournament."});
    }
    return {
        status: 200,
        msg: "Successfully fetched tournament info.",
        target: {
            match_id: null,
            tournament_id: tournament.id,
            type: "tournament",
            sub_type: "online",
            visibility: ((tournament.isPublic()) ? "public" : "private"),
            size: tournament.getCurrentSize().toString() + "/" + tournament.getTournamentSize().toString(),
            creator: tournament.getCreatorAlias(),
            players: Array.from(tournament.getPlayers().values()).map(function(player) {
			    return (player.alias);
		    }),
            status: ((tournament.getCurrentSize()  === tournament.getTournamentSize()) ? "Ready" : "Waiting")
        }
    };
}
