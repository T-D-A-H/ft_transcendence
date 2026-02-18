
module.exports = function startMatch(userManager, user, matchId) {

    const match = userManager.getMatchById(matchId);

    if (!match) {

        return ({status: 400, msg: "Couldn't find match."});
    }
    else if (match.players[0] !== user && match.players[1] !== user) {

        return { status: 404, msg: "You are not in a match."};
    }
    else if (user.getCurrentMatch() === null) {

        return { status: 400, msg: "You are not in a match."};
    }

	match.setReady(user);

    return { status: 200, msg: "Succesfully started match."};
}
