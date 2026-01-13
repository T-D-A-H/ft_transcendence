
const LOGGER = require("../LOGGER.js");
const Game   = require("./Game.js");

class Match {

	static ScoreMax = 2;
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
		this.WINNER = null;
		this.LOSER = null; // TESTING
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
		this.sendDraw();
		this.sendScores();
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

	sendScores() {
		this.broadcast({ type: "SCORES", scores: this.SCORES});
	}

	sendWin(user) {
		this.broadcast({ type: "WIN", msg: user.getUsername() + " Won the game" });
	}

	sendDisconnect(user) {
		this.broadcast({type: "DISCONNECT", msg: user.getUsername() + " disconnected."});
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
			const loser_index = (this.SCORES[0] >= Match.ScoreMax) ? 1 : 0;
			this.WINNER = this.players[winner_index];
			this.LOSER = this.players[loser_index];
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
		if (this.WINNER !== null)
			return (false);
		if (this.isReady[0] === true && this.isReady[1] === true)
			return (true);
		return (false);
	}

	someoneWon() {
		if (this.WINNER === null) {
			return (false);
		}
		return (true);
	}

	getWinner() {
		return (this.WINNER);
	}

	getLoser() {
		return (this.LOSER);
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