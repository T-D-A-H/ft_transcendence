module.exports = function updateDualGameMoves(user, moveDir) {

    const match = user.getCurrentMatch();

    if (!match) {
        return ;
    }

	if (moveDir === "UP1") {

        match.YDir[0] = -1;
	}
	else if (moveDir === "DOWN1") {

        match.YDir[0] = 1;
	}
	else if (moveDir === "STOP1") {

        match.YDir[0] = 0;
	}
	else if (moveDir === "UP2") {

    	match.YDir[1] = -1;
	}
	else if (moveDir === "DOWN2") {

        match.YDir[1] = 1;
	}
	else if (moveDir === "STOP2") {

        match.YDir[1] = 0;
	}
}