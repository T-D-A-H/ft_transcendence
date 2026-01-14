
const LOGGER = require("../LOGGER.js");
const Match = require("./Match.js");

class Tournament {

    constructor(tournament_id, size) { LOGGER(200, "Tournament", "Constructor", "Called");

	
		this.id = tournament_id;
		this.maxPlayers = size;
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

	sendMsg(user, msg) {

		
		if (!user || user.isConnected === false || !user.socket) return ;
		const data = JSON.stringify(msg);

		user.socket.send(data);
	}

	sendWin(user, loserUser) {
		const loser = this.getPlayerAlias(loserUser).alias;
		LOGGER(200, "Tournament", "sendWin", "You Won the tournament game against " + loser + ".");
		this.sendMsg(user, { type: "NOTIFICATION", msg: "You Won the tournament game against " + loser + "."});
	}

	sendLose(user, winnerUser) {
		const winner = this.getPlayerAlias(winnerUser).alias;
		LOGGER(200, "Tournament", "sendLose", winner + " Won the tournament game.");
		this.sendMsg(user, { type: "NOTIFICATION", msg: winner + " Won the tournament game."});
	}

	sendFinalWin(user) {
		LOGGER(200, "Tournament", "sendFinalWin", "You won the tournament!" );
		this.sendMsg(user, { type: "NOTIFICATION", msg: "You won the tournament!" });
	}

	sendMatchStart(user, user2) {
		LOGGER(200, "Tournament", "sendMatchStart", "Playing against " + this.getPlayerAlias(user2).alias + ".");
		this.sendMsg(user, { type: "NOTIFICATION", msg: "Playing against " + this.getPlayerAlias(user2).alias + "."})
	}



	addCreatorAlias(alias = null) {
		const creator_alias = (alias === null) ? "Anonymous" : alias;
		this.creatorAlias = creator_alias;
	}

	addUserToTournament(requestingUser, user_alias) { LOGGER(200, "Tournament", "addUserToTournament", "Added user: " + user_alias);

		
		if (this.players.size >= this.maxPlayers) { LOGGER(400, "Tournament", "addUserToTournament", "Tournament already full.");
			return (false);
		}
		this.players.set(requestingUser, {alias: user_alias});
		this.currentPlayerCount++;
		return (true);
	}

	removeUserFromTournament(requestingUser) { LOGGER(200, "Tournament", "removeUserFromTournament", "Removed user: " + this.players.values(requestingUser));
		this.currentPlayerCount--;
		this.players.delete(requestingUser);
	}

	deleteWinner(user) {
		if (!user) return ;
		this.winners.delete(user);
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
			const entry = nextPlayers.keys().next().value;
			this.WINNER = entry;
		}
		return (nextPlayers);
	}

	isRoundFinished() {

		return  (this.matchDoneCount === this.matches.size && this.getIsReady() === true);
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

	getWinners() {
		return (this.winners);
	}

}

module.exports = Tournament;