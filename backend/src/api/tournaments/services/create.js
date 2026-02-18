
module.exports = async function createTournament(userManager, user, tournamentSize, visibility) {

    const size = Number(tournamentSize);

    if (user.isInGame() === true) {

    	return { status: 400, msg: "You are already in a game/tournament." };
    }
    else if (size < 2 || size > 64 || size % 2 !== 0) {

    	return { status: 400, msg: "Tournament sizes should be even numbers (2-64)." };
    }
    const tournament = await userManager.createTournament(user, user.getDisplayName(), size, visibility);
    
    userManager.addToTournament(user, tournament, user.getDisplayName());

    user.notify("UPDATE", "tournaments");

    return { status: 200, msg: "Tournament created!", tournament_id:  tournament.getId()};
}