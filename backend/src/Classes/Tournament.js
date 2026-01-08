
const LOGGER = require("../LOGGER.js");
const UserManager = require("./UserManager.js");

class Tournament {

    constructor(tournament_id, creatorAlias) {

		LOGGER(200, "Tournament", "Constructor", "Called");
		this.id = tournament_id;
		this.maxPlayers = 4;
		this.currentPlayerCount = 1;
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

	createTournamentMatches() {

        this.setReady();
        const shuffled_players = this.shufflePlayers();
		const tournamentMatches = [];

		for (let i = 0; i < shuffled_players.length; i += 2) {

			const match = UserManager.createMatch(shuffled_players[i], false, this);
			if (i + 1 < shuffled_players.length) {
				UserManager.addToMatch(shuffled_players[i + 1], match);
			}
			tournamentMatches.push(match);
		}
		this.setMatches(tournamentMatches);
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