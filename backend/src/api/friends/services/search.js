
module.exports = function searchFriends(userManager, user, targetId, targetUser) {  //FAKE


    const friends = [];

	for (const usr of userManager.users.values()) {

        if (usr === user) continue;
		    friends.push({
		    	id: usr.id,
		    	username: usr.getUsername(),
		    	display_name: usr.getDisplayName(),
                status: "online"
		    });

	}

    return { status: 200, msg: "Here are your friends", target: friends};
}