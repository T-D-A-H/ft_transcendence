
module.exports = function sendMatchInvite(userManager, user, match_id, targetUsername, targetUserId) {

    const match = userManager.getMatchById(match_id);

	if (!match) {

		return ({status: 400, msg: "Match not found." });
	}
    else if (match !== user.getCurrentMatch()) {

        return ({ status: 404, msg: "You are not part of this match." });
    }
    let targetUser;

    if (targetUsername !== undefined) {

        targetUser = userManager.getUserByUsername(targetUsername);
    }
    else if (targetUserId !== undefined) {

        targetUser = userManager.getUserById(targetUserId);
    }
	if (targetUser === null) {

        return ({ status: 400, msg: `Couldn't find user`});
	}
	else if (targetUser.getIsConnected() === false) {

        return { status: 400, msg: targetUser.getUsername() + " is not online." };
	}
    
	targetUser.addPendingRequest("match", match_id, user.getId());

	targetUser.notify("REQUEST", `${user.getUsername()} sent you an invite request.`, {type: "matches", id: match_id});

    return { status: 200, msg: `Sent invite to play with ${targetUsername}`};
}
