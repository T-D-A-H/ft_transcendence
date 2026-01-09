
const LOGGER = require("../LOGGER.js");


class Tournament {

    constructor(tournament_id) {

		LOGGER(200, "Tournament", "Constructor", "Called");
		this.id = tournament_id;
		this.maxPlayers = 4;
		this.currentPlayerCount = 1;
		this.matchDoneCount = 0;
		this.creatorAlias = null;
		this.isWaiting = true;
		this.isReady = false;
		
		this.players = new Map();
		this.matches = new Map();
		this.winners = new Map();
	}

	addCreatorAlias(alias) {
		this.creatorAlias = alias;
	}

	addUserToTournament(requestingUser, requestingAlias) {

		if (this.players.size >= this.maxPlayers)
			return (false);
		this.players.set(requestingUser, {alias: requestingAlias});
		this.currentPlayerCount++;
		return (true);
	}

	removeUserFromTournament(requestingUser) {
		return this.players.delete(requestingUser);
	}


	updateWinner(requestedMatch, userWhoWon) {

		const match = this.matches.get(requestedMatch);
		if (!match)
			return false;
		this.winners.set(userWhoWon, this.players.get(userWhoWon));
		this.matchDoneCount++;
		return true;
	}

	prepareNextRound() {

		const nextPlayers = new Map(this.winners);

		this.matches.clear();
		this.players = nextPlayers;
		this.winners.clear();
		this.matchDoneCount = 0;

		return (nextPlayers);
	}

	isRoundFinished() {

		return  (this.matchDoneCount == this.matches.size);
	}

	isTournamentFinished() {

		return (this.players.size === 1 && this.matches.size === 0);
	}

	getWinner() {
		
	    if (this.isTournamentFinished())
	        return [...this.players.keys()][0];
	    return null;
	}

	getIfTournamentFull() {
		return (this.players.size === this.maxPlayers);
	}

	isWaitingAndFull() {

		if (this.isWaiting === true && this.getIfTournamentFull()) {
			return (true);
		}
		return (false);
	}

	setReady() {

		this.isWaiting = false;
		this.isReady = true;
	}

	getPlayers() {
		return (this.players);
	}

	getIsReady() {
		return (this.isReady);
	}

	getTournamentId() {
		return (this.id);
	}

	getIsWaiting() {
		return (this.isWaiting);
	}

	getTournamentSize() {
		return (this.maxPlayers);
	}

	getCurrentSize() {
		return (this.currentPlayerCount);
	}

	getCreatorAlias() {
		return (this.creatorAlias);
	}

}

module.exports = Tournament;