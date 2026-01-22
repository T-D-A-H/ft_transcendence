sendDraw() {

		let [x0, y0]= this.game.getLeftPlayerXY();
		x0 = x0 + Game.Screen.WIDTH - 30;
		y0 = Game.Screen.HEIGHT - y0 - Game.Paddle.HEIGHT;
		let [x1, y1] = this.game.getRightPlayerXY();
		x1 = x1 - Game.Screen.WIDTH + 30;
		let [xb, yb] = this.game.getBallXY();
		xb = Game.Screen.WIDTH - xb + Game.Ball.OFFSET;
		yb = Game.Screen.HEIGHT - yb - Game.Ball.OFFSET;
		this.players[0].socket.send(JSON.stringify({ 
			type: "DRAW", 
			LeftXY: [x0, y0],
			RightXY: [x1, y1],
			BallXY: [xb, yb]

		}));

		this.players[1].socket.send(JSON.stringify({ 
			type: "DRAW", 
			LeftXY: this.game.getLeftPlayerXY(),
			RightXY: this.game.getRightPlayerXY(),
			BallXY: this.game.getBallXY()
		}));
	}

    	sendScores() {
		let invertedScores = [];
		invertedScores[0] = this.SCORES[1];
		invertedScores[1] = this.SCORES[0];
		this.players[0].socket.send(JSON.stringify({ type: "SCORES", scores: invertedScores}));
		this.players[1].socket.send(JSON.stringify({ type: "SCORES", scores: this.SCORES}));
	}
    

    updateGame(user, moveDir) {

		const index = this.players.indexOf(user);
		if (index === -1) 
            return;
		if (index === 0) {
			if (moveDir === "UP")
				this.YDir[index] = 1;
			else if (moveDir === "DOWN")
				this.YDir[index] = -1;
			else if (moveDir === "STOP")
				this.YDir[index] = 0;
			return ;
		}
		if (moveDir === "UP")
			this.YDir[index] = -1;
		else if (moveDir === "DOWN")
			this.YDir[index] = 1;
		else if (moveDir === "STOP")
			this.YDir[index] = 0;
		
	}

    