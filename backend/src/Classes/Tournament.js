
const LOGGER = require("../LOGGER.js");


class Tournament {

    constructor(tournament_id) { LOGGER(200, "Tournament", "Constructor", "Called");

	
		this.id = tournament_id;
		this.maxPlayers = 2;
		this.currentPlayerCount = 0;
		this.matchDoneCount = 0;
		this.creatorAlias = null;
		this.isWaiting = true;
		this.isReady = false;
		this.WINNER = null;
		
		this.players = new Map();
		this.matches = new Map();
		this.winners = new Map();
	}

	addCreatorAlias(alias) {
		const creator_alias = (alias === null) ? "Anonymous" : alias;
		this.creatorAlias = creator_alias;
	}

	addUserToTournament(requestingUser, alias) { LOGGER(200, "Tournament", "addUserToTournament", "Added user: " + requestingAlias);

		
		if (this.players.size >= this.maxPlayers) { LOGGER(400, "Tournament", "addUserToTournament", "Tournament already full.");
			return (false);
		}
		const user_alias = (alias === null) ? "Anonymous" : alias;
		this.players.set(requestingUser, {alias: user_alias});
		this.currentPlayerCount++;
		return (true);
	}

	removeUserFromTournament(requestingUser) { LOGGER(200, "Tournament", "removeUserFromTournament", "Removed user: " + this.players.values(requestingUser));
		
		this.players.delete(requestingUser);
	}


	updateWinner(requestedMatch, userWhoWon) { LOGGER(200, "Tournament", "updateWinner", "Called");

		
		const match = this.matches.get(requestedMatch);
		if (!match)
			return false;
		this.winners.set(userWhoWon, this.players.get(userWhoWon));
		this.matchDoneCount++;
		return true;
	}

	prepareNextRound() { LOGGER(200, "Tournament", "prepareNextRound", "Called");

		
		const nextPlayers = new Map(this.winners);

		this.matches.clear();
		this.winners.clear();
		this.matchDoneCount = 0;
		if (nextPlayers.size === 1) {
			this.WINNER = nextPlayers.keys()[0];
		}
		match.count++;
		return (nextPlayers);
	}

	isRoundFinished() {

		return  (this.matchDoneCount == this.matches.size && this.getIsReady() === true);
	}


	getWinner() {
		
	    return (this.WINNER);
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

	unsetReady() {
		this.isReady = false;
        this.isWaiting = false;
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

	getId() {
		return (this.id);
	}

	getPlayerAlias(user) {

		return (this.players.get(user));
	} 

}

module.exports = Tournament;