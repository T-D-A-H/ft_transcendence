
class Match {

	constructor(user1, user2) {
		this.players = [user1, user2];
		this.playerCoords = [0, 0];
		this.playerY = [150, 150];
		this.isActive = true;
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
		console.log("player1Y: " + this.playerY[0] + " player2Y: " + this.playerY[1]);
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
