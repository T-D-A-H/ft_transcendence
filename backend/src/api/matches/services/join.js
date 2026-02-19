
module.exports = function joinMatch(userManager, user, match_id) {

    const match = userManager.getMatchById(match_id);

    if (!match) {

        return ({status: 400, msg: "Couldn't find match."});
    }
    else if (user.isInGame() === true) {

		if (user.getCurrentMatch() === match) {
			
			return { status: 400, msg: "You are already in this match." };
		}
		return { status: 400, msg: "You are already in a game/tournament." };
	}
    else if (!match.isPublic() && !user.hasPendingRequest("matches", match_id, match.getCreator().getId())) {

        return ({status: 404, msg: "Cannot join private match."});
    }
    else if (match.getTournament() !== null) {

        return ({status: 404, msg: "Cannot join match directly as it is part of a tournament."});
    }
    else if (match.getSize() === 2) {

        return ({status: 400, msg: "Match already full."});
    }

    userManager.addToMatch(user, match);

    const creator = match.getCreator();

    creator.notify("NOTIFICATION", `${creator.getUsername()} joined your match`);

    match.broadcast("UPDATE", "matches");
    
    return ({status: 200, msg: "Succesfully joined match."});
}
