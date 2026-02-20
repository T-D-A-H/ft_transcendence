
const LOGGER = require("../LOGGER.js");
const Match = require("./Match.js");
const UserManager = require("./UserManager.js");

class Tournament {

    constructor(creatorUserId, creatorAlias = null, tournament_id, size, visibility) { LOGGER(200, "Tournament.js", "Constructor", "Called with id: " + tournament_id);

		this.id = tournament_id;
		this.maxPlayers = size;
		this.currentPlayerCount = 0;
		this.matchDoneCount = 0;
		this.visibility = visibility;

		this.creatorId = creatorUserId;
		this.creatorAlias = creatorAlias;
        this.playerScores = new Map();
        this.blockchainId = null;
        this.blockchainName = null;
		
		this.isWaiting = true;
		this.isReady = false;
		this.WINNER = null;
		
		this.players = new Map();
		this.matches = new Map();
		this.winners = new Map();
	}

	isPublic() {
		return (this.visibility);
	}

	broadcast(UserManager, type, msg, info, excludedUserIds = []) {

	    for (const [userId] of this.players) {

	        if (excludedUserIds !== null && !excludedUserIds.includes(userId))
	            UserManager.getUserByID(userId).notify(type, msg, info);
	    }
	}

	addUser(requestingUserId, user_alias) {
		LOGGER(200, "Tournament.js", "addUser", "Added user: " + user_alias);
		if (this.players.size >= this.maxPlayers) { LOGGER(400, "Tournament.js", "addUser", "Tournament already full.");
			return (false);
		}
		this.players.set(requestingUserId, {alias: user_alias});
		this.currentPlayerCount++;
		return (true);
	}

	removePlayer(requestingUserId) {
		LOGGER(200, "Tournament.js", "removePlayer", "Removed user: " + this.players.values(requestingUserId));
		this.currentPlayerCount--;
		this.players.delete(requestingUserId);
	}

	deleteWinner(userId) {
		if (!user) return ;
		this.winners.delete(userId);
	}

	updateWinner(requestedMatchId, userWhoWonId) { 
		LOGGER(200, "Tournament.js", "updateWinner", "Called");

		const match = this.matches.get(requestedMatchId);
		if (!match)
			return false;
		
		this.winners.set(userWhoWonId, this.players.get(userWhoWonId));
		this.matchDoneCount++;
		
		const currentScore = this.playerScores.get(userWhoWonId) || 0;
		this.playerScores.set(userWhoWonId, currentScore + 100);
		// --------------------------------------
		
		return true;
	}

	sendLose(loserUser, winnerUser) {
		LOGGER(200, "Tournament.js", "sendLose", `${loserUser.getDisplayName()} lost`);
		
		const winnerAlias = this.getPlayerAlias(winnerUser.getId());
		
		loserUser.notify("TOURNAMENT_ELIMINATED", `You were eliminated by ${winnerAlias}`, {
			tournament_id: this.id,
			winner: winnerAlias
		});
	}

	prepareNextRound() { LOGGER(200, "Tournament.js", "prepareNextRound", "Called");

		
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

	getCreator() {
		return (this.creatorId);
	}

	getCreatorAlias() {
		return (this.creatorAlias);
	}

	getId() {
		return (this.id);
	}

	getPlayer(userId) {

		return (this.players.get(userId));
	}

	getPlayerAlias(userId) {

		const entry = this.players.get(userId);
		if (!entry) {
			return null;
		}
		return entry.alias;
	}

	getWinners() {
		if (this.winners.length === 0)
			return (null);
		return (this.winners);
	}

	getActiveMatches() {

		const active_matches = [];

		for (const [match_id] of this.matches) {

			active_matches.push({
				id: match_id,
			});
		}
		return (active_matches);
	}

	getMatchById(match_id) {

		if (!this.matches.has(match_id))
			return (null);
		return (this.matches.get(match_id));
	}
        getPlayerScore(user) {
        return this.playerScores.get(user) || 0;
    }

    initializePlayerScores() {
        for (const user of this.players.keys()) {
            if (!this.playerScores.has(user)) {
                this.playerScores.set(user, 0);
            }
        }
    }

}

module.exports = Tournament;
