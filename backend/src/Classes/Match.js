
const LOGGER = require("../LOGGER.js");
const Game = require("./Game.js");

class Match {

	constructor(user, match_id, locally, num_games) {
		
		LOGGER(200, "Match", "Constructor", "For " + user.getUsername() + " match_id: " + match_id);

		this.id = match_id;
		this.gameIndex = 0;
		this.game = Array.from({ length: num_games }, () => new Game());
		this.locally = locally;
		this.players = [user, null];
		this.isWaiting = true;
		this.isReady = [null, null];
		if (locally === true) {
			this.players[1] = user;
			this.isWaiting = false;
			this.isReady = [true, true];
		}
	}

	addUserToMatch(user) {
		LOGGER(200, "Match", "addUserToMatch", "For " + user.getUsername() + " match_id: " + this.id);
		this.players[1] = user;
		this.playerCoords[1] = 0;
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
			LeftXY: this.game[this.gameIndex].getLeftPlayerXY(),
			RightXY: this.game[this.gameIndex].getRightPlayerXY(),
			BallXY: this.game[this.gameIndex].getBallXY()
		});
	}

	sendInitialVars() {
		this.broadcast({ 
			type: "VARS", 
			PaddleWH: this.game[this.gameIndex].getPaddleWidthAndHeight(),
			BallWH: this.game[this.gameIndex].getBallWidthAndHeight()
		});
	}

	sendScores() {
		this.broadcast({ 
			type: "SCORE", 
			scores: this.game[this.gameIndex].getScores()
		});
	}

  
	updateGame(user, moveDir) {

		const index = this.players.indexOf(user);
		if (index === -1) 
            return;

		if (moveDir === "UP")
			this.game[this.gameIndex].updatePlayerPaddle(index, -1);
		else if (moveDir === "DOWN") 
            this.game[this.gameIndex].updatePlayerPaddle(index, 1);
		else if (moveDir === "STOP") 
            this.game[this.gameIndex].updatePlayerPaddle(index, 0);
		this.game[this.gameIndex].updateBall();
	}
    
	update2PlayerGame(user, moveDir) {

		if (moveDir === "UP1") 
            this.game[this.gameIndex].updatePlayerPaddle(0, -1);
		if (moveDir === "DOWN1") 
            this.game[this.gameIndex].updatePlayerPaddle(0, -1);
		if (moveDir === "STOP1") 
            this.game[this.gameIndex].updatePlayerPaddle(0, 0);
		if (moveDir === "UP2") 
        	this.game[this.gameIndex].updatePlayerPaddle(1, -1);
		if (moveDir === "DOWN2") 
            this.game[this.gameIndex].updatePlayerPaddle(1, 1);
		if (moveDir === "STOP2") 
            this.game[this.gameIndex].updatePlayerPaddle(1, 0);
	}

	end() {
		this.isActive = false;
		this.players.forEach(player => player.disconnect());
	}
}

module.exports = Match;