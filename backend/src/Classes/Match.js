
const LOGGER = require("../LOGGER.js");

class Match {

	constructor(user, match_id, locally) {
		
		if (locally === false)
			LOGGER(200, "Match", "Constructor", "For " + user.getUsername() + " match_id: " + match_id);
		this.id = match_id;
		this.locally = locally;
		this.players = [user, null];
		this.playerCoords = [0, null];
		this.playerY = [150, null];
		this.isWaiting = true;
		this.isReady = [null, null];
		this.ballXY = [0, 0]
		if (locally === true) {
			LOGGER(200, "Match", "Local Constructor", "For " + user.getUsername() + " match_id: " + match_id);
			this.players[1] = user;
			this.playerCoords[1] = 0;
			this.playerY[1] = 150;
			this.isWaiting = false;
			this.isReady = [true, true];
		}

	}

	addUserToMatch(user) {
		LOGGER(200, "Match", "addUserToMatch", "For " + user.getUsername() + " match_id: " + this.id);
		this.players[1] = user;
		this.playerCoords[1] = 0;
		this.playerY[1] = 150;
		this.isWaiting = false; 
	}

	setReady(user) {
		const i = this.players.indexOf(user);
		if (i !== -1)
			this.isReady[i] = true;
		LOGGER(200, "Match", "setReady", user.getUsername() + " is now ready to start match.");
	}

    broadcast(msg) {
		const data = JSON.stringify(msg);
		if (this.locally === true && this.players[0].isConnected && this.players[0].socket) {
			this.players[0].socket.send(data)
			return ;
		}
		this.players.forEach(user => {
			if (user.isConnected && user.socket) user.socket.send(data);
		});
	}

	updateCoords(SPEED) {
		
		for (let i = 0; i < 2; i++) {
			this.playerY[i] += this.playerCoords[i] * SPEED;
			this.ballXY[i] += this.playerCoords[i] * SPEED;
			this.playerY[i] = Math.max(0, Math.min(340, this.playerY[i]));
		}
	}

	sendState(SPEED) {
		this.updateCoords(SPEED);
		this.broadcast({ type: "DRAW", playerY1: this.playerY[0], ballY: this.ballXY[0], ballX: this.ballXY[1], playerY2: this.playerY[1] });
	}

	setPlayerMove(user, moveDir) {
		const i = this.players.indexOf(user);
		if (i === -1) 
            return;

		if (moveDir === "UP") 
            this.playerCoords[i] = -1;
		else if (moveDir === "DOWN") 
            this.playerCoords[i] = 1;
		else if (moveDir === "STOP") 
            this.playerCoords[i] = 0;
	}
    
	set2PlayerMove(user, moveDir) {

		if (moveDir === "UP1") 
            this.playerCoords[0] = -1;
		if (moveDir === "DOWN1") 
            this.playerCoords[0] = 1;
		if (moveDir === "STOP1") 
            this.playerCoords[0] = 0;
		if (moveDir === "UP2") 
        	this.playerCoords[1] = -1;
		if (moveDir === "DOWN2") 
            this.playerCoords[1] = 1;
		if (moveDir === "STOP2") 
            this.playerCoords[1] = 0;
	}

	end() {
		this.isActive = false;
		this.players.forEach(player => player.disconnect());
	}
}

module.exports = Match;