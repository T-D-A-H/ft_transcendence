
const LOGGER = require("../LOGGER.js");

class Tournament {

    constructor(creatorAlias, tournament_id, numPlayers) {

		LOGGER(200, "Tournament", "Constructor", "Called");
		this.id = tournament_id;
		this.maxPlayers = numPlayers;
		this.currentPlayerCount = 0;
		this.creatorAlias = creatorAlias;
		this.players = new Map();
		this.playerAliases = new Map();
		this.isWaiting = true;
		this.isReady = false;
	}


	addUserToTournament(user, alias) {

		if (this.players.size >= this.maxPlayers)
			return (false);

		if (this.players.has(user.id))
			return (false);

		this.players.set(user.id, user);
		this.playerAliases.set(user.id, alias);
		return (true);
	}

	removeUserFromTournament(userId) {
		return this.players.delete(userId);
	}


	getIfTournamentFull() {
		return (this.players.size === this.maxPlayers);
	}

	isWaitingAndReady() {

		if (this.isWaiting === true && this.getIfTournamentFull()) {
			this.isWaiting = false;
			this.isReady = true;
			return (true);
		}
		return (false);
	}

	startMatches() {
		tournament.isWaiting = false;
        tournament.isReady = true;
	}
	isReady() {
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