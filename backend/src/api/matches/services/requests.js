
module.exports = function matchesRequests(userManager, user) {

	const request_list = user.getPendingRequests();

	if (request_list.length === 0) {

        return { status: 400, msg: "You have no pending requests."};
	}
    const list = [];

	for (const req of request_list.values()) {

        if (req.type !== "matches")
            continue ;

        const targetUser = userManager.getUserByID(req.user);

		list.push({

			type: req.type,
			id: req.id,
			display_name: targetUser.getDisplayName(),
			username: targetUser.getUsername()
		});
	}
    return { status: 200, msg: "Pending match requests list updated.", target: list};
}