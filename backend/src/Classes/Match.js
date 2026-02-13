const LOGGER = require("../LOGGER.js");
const Game   = require("./Game.js");

class Match {

	static ScoreMax = 4;
	constructor(user, match_id, matchType, tournament, visibility) { LOGGER(200, "Match.js", "Constructor", "For " + user.getUsername() + " match_id: " + match_id);
		
		this.id = match_id;
		this.creator = user;
		this.tournament = tournament;
		this.matchType = matchType;
		this.visibility = visibility;
        this.startTime = Date.now();
        this.endTime = null;
		this.locally = false;
		if (matchType === "ai_easy" || matchType === "ai_medium" || matchType === "ai_hard" || matchType === "2player") {
            this.locally = true;
        }

		this.game = new Game();
		this.players = [null, null];
		this.isWaiting = true;
		this.isReady = [false, false];

		this.YDir = [0, 0];
		this.SCORES = [0, 0];
		this.WINNER = null;
		this.LOSER = null;

		this.STARTED = false;
		this.size = 0;
	}

	isPublicMatch() {
		return (this.public);
	}

    broadcast(type, msg, info) {

		if (this.matchType === "ai" || this.matchType === "2player") {
			this.players[0].notify(type, msg, info)
			return ;
		}
		this.players.forEach(user => {
			user.notify(type, msg, info);
		});
	}

	addUserToMatch(user) {

		LOGGER(200, "Match.js", "addUserToMatch", "For " + user.getUsername() + " match_id: " + this.id);
		if (this.players[0] === null) this.players[0] = user;
		else if (this.players[1] === null) this.players[1] = user;
		this.size++;
	}


	setReady(user) { LOGGER(200, "Match.js", "setReady", user.getUsername() + " is now ready to start match.");

		let i = 0;
		for (const player of this.players) {

			if (player === user)
				this.isReady[i] = true;
			i++;
		}
	}


	updateMatch() {

		this.game.updatePlayerPaddle(this.YDir);
		this.game.updateBall();
		this.broadcast("DRAW", null, {LeftXY: this.game.getLeftPlayerXY(), RightXY: this.game.getRightPlayerXY(), BallXY: this.game.getBallXY()});

		const GameScores = this.game.getScores();
		if (this.playerScored(GameScores) === true) {

			const winner_index = (this.SCORES[0] !== GameScores[0]) ? 0 : 1;
			this.game.restartGame(winner_index);
			this.updateScores(GameScores);
			this.broadcast("SCORES", null, {scores: this.SCORES});
		}
		if (this.playerWonMatch() === true) {

			LOGGER(200, "Match.js", "playerWonMatch", "called");
			const winner_index = (this.SCORES[0] >= Match.ScoreMax) ? 0 : 1;
			const loser_index = (this.SCORES[0] >= Match.ScoreMax) ? 1 : 0;
			this.setWINNER(winner_index);
			this.setLOSER(loser_index);
		}
	}

	playerScored(GameScores) {

		if (GameScores[0] !== this.SCORES[0] || GameScores[1] !== this.SCORES[1]) {
			return (true);
		}
		return (false);
	}

	playerWonMatch() {

		if (this.SCORES[0] >= Match.ScoreMax || this.SCORES[1] >= Match.ScoreMax) {
			return (true);
		}
		return (false);
	}

	updateScores(GameScores) {

		this.SCORES = [...GameScores];
	}


	shouldContinuePlaying() {

	    if (!this.players[0] || !this.players[1])
			return (false);
		else if (this.WINNER !== null)
			return (false);
		return (true);
	}

	someoneWon() {
		return (this.WINNER !== null)
	}

	getWinner() {
		return (this.WINNER);
	}

	getLoser() {
		return (this.LOSER);
	}

	getId() {
		return (this.id);
	}

	getCreatorUser() {
		return (this.players[0]);
	}
	
	getTournament() {
		return (this.tournament);
	}

	setWINNER(winner_index) {
		this.WINNER = this.players[winner_index];
	}

	setLOSER(loser_index) {
		this.LOSER = this.players[loser_index];
	}

	getPlayers() {
		return (this.players);
	}


	getPlayerSides(user) {
		if (this.players[0] === user)
			return ("right");
		else if (this.players[1] === user)
			return ("left");
	}

	getType() {
		return (this.matchType);
	}

	getCreator() {
		return (this.creator);
	}

	isFull() {
		return (this.players[0] !== null && this.players[1] !== null);
	}

	setWaiting(waiting) {
		this.isWaiting = waiting;
	}

	setSTARTED(start) {
		this.STARTED = start;
	}

	getSTARTED() {
		return (this.STARTED);
	}

	playersReady() {
		return (this.isReady[0] === true && this.isReady[1] === true);
	}

	getSecondPlayerName() {

		if (this.matchType === "online") {
			if (this.players[1])
				return this.players[1].getDisplayName();
			return (null);
		}
		else if (this.matchType === "2player") {

			return (this.players[0].getDisplayName() + "(1)");
		}
		else {

			return (this.matchType);
		}
	}
    getStartTime() {
        return this.startTime;
    }

    setEndTime() {
        this.endTime = Date.now();
    }

    getEndTime() {
        return this.endTime;
    }

    getIsLocal() {
        return this.locally === true;
    }

	getScores() {
		return this.SCORES;
	}

	getMatchType() {
		return (this.matchType);
	}
}

module.exports = Match;