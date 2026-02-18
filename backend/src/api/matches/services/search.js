
module.exports = function searchMatches(userManager) {

    const available_matches = [];

	for (const match of userManager.matches.values()) {

        if (match.isPublic() && match.STARTED === false) {

		    available_matches.push({
		    	id: match.getId(),
		    	creator: match.getCreator().getDisplayName(),
		    	max_size: 2,
		    	current_size: 1
		    });
        }
	}
	if (available_matches.length === 0) {

        return { status: 400, msg: "Found No Open Matches.", target: null };
    }
	return { status: 200, msg: "Found Open Matches.", target: available_matches };
}

