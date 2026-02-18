
module.exports = function createMatch(userManager, user, visibility, type) {

        if (user.getIsConnected() === false) {

            return { status: 400, msg: "You need to log in to be able to play."};
    	}
        else if (user.isInGame() === true) {

            return { status: 400, msg: "You are already in a match/tournament." };
        }
        else if (type !== "ai_easy" && type !== "ai_medium" && type !== "ai_hard" && type !== "2player" && type !== "online") {

            return { status: 400, msg: "Unknown match type." };
        }
        else if ((type === "ai_easy" || type === "ai_medium" || type === "ai_hard" || type === "2player") && visibility === true) {

            return { status: 404, msg: "Local matches can only be private." };
        }
        const match = userManager.createMatch(user, type, null, visibility);

    	userManager.addToMatch(user, match);
        user.notify("UPDATE", "matches");
    	if (type === "2player") {

    		userManager.addToMatch(user, match);
    	}
    	else if (type === "ai_easy" || type === "ai_medium" || type === "ai_hard") {

    		userManager.addToMatch(user, match);
    	}
        
        return { status: 200, msg: "Succesfully created match!", match_id: match.id };
    }
