
module.exports = function tournamentsRequests(userManager, user) {

	const request_list = user.getPendingRequests();

	if (request_list.length === 0) {

        return { status: 400, msg: "You have no pending requests."};
	}
    const list = [];

	for (const req of request_list.values()) {

        if (req.type !== "tournament")
            continue ;

        const targetUser = userManager.getUserByID(req.user);

		list.push({

			type: req.type,
			id: req.id,
			display_name: targetUser.getDisplayName(),
			username: targetUser.getUsername()
		});
	}
    return { status: 200, msg: "Pending tournament requests list updated.", target: list};
}