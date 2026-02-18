
module.exports = function getMatchDetails(userManager, user) {

    const match = user.getCurrentMatch();

    if (!match) {
        if (user.getCurrentTournament() !== null)
            return ({status: 302, msg: "Fetch tournaments.",  target: "tournaments"});
        return ({status: 400, msg: "You are not in a match."})
    }
    return {
        status: 200,
        msg: "Success",
        target: {
            match_id: match.id,
            tournament_id: null,
            type: "match",
            sub_type: match.getType(),
            visibility: ((match.isPublic()) ? "public" : "private"),
            size: match.size.toString() + "/2",
            creator: match.getCreatorUser().getDisplayName(),
            players: [match.players[0].getDisplayName(), match.getSecondPlayerName()],
            status: (match.size === 2) ? "Ready" : "Waiting"
        }
    };
}
