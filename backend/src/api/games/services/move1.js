module.exports = function updateSingularGameMoves(user, moveDir) {

    const match = user.getCurrentMatch();

    if (!match) {
        return ;
    }

	const index = match.players.indexOf(user);
    
	if (index === -1) {
        return ;
    }

	if (moveDir === "UP") {

		match.YDir[index] = -1;
	}
	else if (moveDir === "DOWN") {

		match.YDir[index] = 1;
	}
	else if (moveDir === "STOP") {

		match.YDir[index] = 0;
	}
		
}