
const LOGGER = require("../LOGGER.js");
const Game   = require("./Game.js");

class Match {

	static ScoreMax = 11;
	constructor(user, match_id, locally, tournament) {
		
		LOGGER(200, "Match", "Constructor", "For " + user.getUsername() + " match_id: " + match_id);

		this.id = match_id;
		this.tournament = tournament;
		this.locally = locally;
		this.game = new Game();
		this.players = [user, null];
		this.isWaiting = true;
		this.isReady = [null, null];
		this.YDir = [0, 0];
		this.SCORES = [0, 0];
		this.WINNNER = null;
		if (locally === true) {
			this.players[1] = user;
			this.isWaiting = false;
			this.isReady = [true, true];
		}
	}

	addUserToMatch(user) {
		LOGGER(200, "Match", "addUserToMatch", "For " + user.getUsername() + " match_id: " + this.id);
		this.players[1] = user;
		this.isWaiting = false; 
	}

	setReady(user) {
		LOGGER(200, "Match", "setReady", user.getUsername() + " is now ready to start match.");
		const i = this.players.indexOf(user);
		if (i !== -1)
			this.isReady[i] = true;
	}

    broadcast(msg) {
		const data = JSON.stringify(msg);
		if (this.locally === true && this.players[0].isConnected && this.players[0].socket) {
			this.players[0].socket.send(data)
			return ;
		}
		this.players.forEach(user => {
			if (user.isConnected && user.socket)
				user.socket.send(data);
		});
	}


	sendDraw() {
		this.broadcast({ 
			type: "DRAW", 
			LeftXY: this.game.getLeftPlayerXY(),
			RightXY: this.game.getRightPlayerXY(),
			BallXY: this.game.getBallXY()
		});
	}

	sendInitialVars() {
		this.broadcast({ 
			type: "VARS", 
			PaddleWH: this.game.getPaddleWidthAndHeight(),
			BallWH: this.game.getBallWidthAndHeight()
		});
	}

	sendScores() {
		this.broadcast({ type: "SCORES", scores: this.SCORES});
	}

	sendWin(user_index) {
		this.broadcast({ type: "WIN", msg: this.players[user_index].getUsername() + " Won the game." });
	}

	updateMatch() {

		this.sendDraw();
		this.game.updatePlayerPaddle(this.YDir);
		this.game.updateBall();

		const GameScores = this.game.getScores();
		if (this.playerScored(GameScores) === true) {

			const winner_index = (this.SCORES[0] !== GameScores[0]) ? 0 : 1;
			this.game.restartGame(winner_index);
			this.updateScores(GameScores);
			this.sendScores();
		}
		if (this.playerWonMatch() === true) {

			const winner_index = (this.SCORES[0] >= Match.ScoreMax) ? 0 : 1;
			this.WINNNER = this.players[winner_index];
			this.sendWin(winner_index);
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

	updateGame(user, moveDir) {

		const index = this.players.indexOf(user);
		if (index === -1) 
            return;
		if (moveDir === "UP")
			this.YDir[index] = -1;
		else if (moveDir === "DOWN")
			this.YDir[index] = 1;
		else if (moveDir === "STOP")
			this.YDir[index] = 0;
		
	}
    
	update2PlayerGame(moveDir) {

		if (moveDir === "UP1") 
            this.YDir[0] = -1;
		if (moveDir === "DOWN1") 
            this.YDir[0] = 1;
		if (moveDir === "STOP1") 
            this.YDir[0] = 0;
		if (moveDir === "UP2") 
        	this.YDir[1] = -1;
		if (moveDir === "DOWN2") 
            this.YDir[1] = 1;
		if (moveDir === "STOP2") 
            this.YDir[1] = 0;
	}

	shouldContinuePlaying() {
		if (this.isWaiting)
			return (false);
	    if (!this.players[0] || !this.players[1])
			return (false);
		if (this.WINNNER !== null)
			return (false);
		if (this.isReady[0] === true && this.isReady[1] === true)
			return (true);
		return (false);
	}

	someoneWon() {
		if (this.WINNNER === null) {
			return (false);
		}
		return (true);
	}

	getWinner() {
		return (this.WINNNER);
	}

	getMatchId() {
		return (this.id);
	}

	getCreatorUser() {
		return (this.players[0]);
	}
	
	getTournament() {
		return (this.tournament);
	}

}

module.exports = Match;