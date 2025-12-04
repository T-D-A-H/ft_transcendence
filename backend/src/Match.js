
const LOGGER = require("./LOGGER.js");

class Match {

	constructor(user, match_id) {
		LOGGER("Match: Constructor called for: " + user.getUsername() + " match_id: " + match_id, 200);
		this.id = match_id;
		this.players = [user, null];
		this.playerCoords = [0, null];
		this.playerY = [150, null];
		this.isWaiting = true;
		this.isReady = [null, null];
	}

	addUserToMatch(user) {
		LOGGER("addUserToMatch: Added user: " + user.getUsername() + " to match_id: " + this.id + " with: " + this.players[0].getUsername(), 200);
		this.players[1] = user;
		this.playerCoords[1] = 0;
		this.playerY[1] = 150;
		this.isWaiting = false; 
	}

    broadcast(msg) {
		const data = JSON.stringify(msg);
		this.players.forEach(user => {
			if (user.isConnected && user.socket) user.socket.send(data);
		});
	}

	updateCoords(SPEED) {
		
		for (let i = 0; i < 2; i++) {
			this.playerY[i] += this.playerCoords[i] * SPEED;
			this.playerY[i] = Math.max(0, Math.min(340, this.playerY[i]));
		}
	}

	sendState(SPEED) {
		this.updateCoords(SPEED);
		this.broadcast({ type: "MOVE", playerY1: this.playerY[0], playerY2: this.playerY[1] });
	}

	setPlayerMove(user, moveDir) {
		const i = this.players.indexOf(user);
		if (i === -1) 
            return;

		if (moveDir === "MOVE_UP") 
            this.playerCoords[i] = -1;
		else if (moveDir === "MOVE_DOWN") 
            this.playerCoords[i] = 1;
		else if (moveDir === "STOP") 
            this.playerCoords[i] = 0;
	}
    

	end() {
		this.isActive = false;
		this.players.forEach(player => player.disconnect());
	}
}

module.exports = Match;