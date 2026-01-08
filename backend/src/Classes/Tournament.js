
const LOGGER = require("../LOGGER.js");
const Match = require("./Match.js");

class Tournament {

    constructor(creatorAlias, tournament_id) {

		LOGGER(200, "Tournament", "Constructor", "Called");
		this.id = tournament_id;
		this.maxPlayers = 4;
		this.currentPlayerCount = 0;
		this.creatorAlias = creatorAlias;
		this.players = new Map();
		this.isWaiting = true;
		this.isReady = false;
		this.matches = null;
	}


	addUserToTournament(requestingUser, requestingAlias) {

		if (this.players.size >= this.maxPlayers)
			return (false);
		this.players.set(requestingUser, {alias: requestingAlias, score: 0});
		this.currentPlayerCount++;
		return (true);
	}

	removeUserFromTournament(requestingUser) {
		return this.players.delete(requestingUser);
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

	shufflePlayers() {


		const entries = Array.from(this.players.entries());

		for (let i = entries.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[entries[i], entries[j]] = [entries[j], entries[i]];
		}

		this.players = new Map(entries);
		return (Array.from(this.players.keys()));

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

	setMatches(matches) {
		this.matches = matches;
	}

}

module.exports = Tournament;