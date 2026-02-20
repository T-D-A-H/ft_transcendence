module.exports = function exitMatch(userManager, user, matchId) {

    const match = userManager.getMatchById(matchId);

    if (!match) {

        return { status: 400, msg: "Couldn't find match." };
    }
    else if (user.getCurrentMatch() === null) {

        return { status: 400, msg: "You are not in a match."};
    }
    else  if (match !== user.getCurrentMatch()) {

        return { status: 404, msg: "You are not in this match."};
    }
    userManager.disconnectUser(user);
    return { status: 200, msg: "Succesfully exited Match."};
}
