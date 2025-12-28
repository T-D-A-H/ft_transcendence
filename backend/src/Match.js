const LOGGER = require("./LOGGER.js");

class Match {
  constructor(user, match_id, opts = {}) {
    LOGGER(
      "Match: Constructor called for: " +
        user.getUsername() +
        " match_id: " +
        match_id,
      200
    );
    this.id = match_id;
    this.isAIMatch = opts.isAIMatch || false;
    this.players = [user, opts.aiPlayer || null];
    this.playerCoords = [0, opts.aiPlayer ? 0 : null];
    this.playerY = [150, opts.aiPlayer ? 150 : null];
    this.isWaiting = opts.aiPlayer ? false : true;
    this.isReady = [null, opts.aiPlayer ? true : null];
    this.ball = { x: 300, y: 200, vx: -4, vy: 3, size: 10 };
  }

  addUserToMatch(user) {
    LOGGER(
      "addUserToMatch: Added user: " +
        user.getUsername() +
        " to match_id: " +
        this.id +
        " with: " +
        this.players[0].getUsername(),
      200
    );
    this.players[1] = user;
    this.playerCoords[1] = 0;
    this.playerY[1] = 150;
    this.isWaiting = false;
  }

  attachAI(aiUser) {
    this.players[1] = aiUser;
    this.playerCoords[1] = 0;
    this.playerY[1] = 150;
    this.isWaiting = false;
    this.isReady[1] = true;
  }

  broadcast(msg) {
    const data = JSON.stringify(msg);
    this.players.forEach((user) => {
      if (user.isConnected && user.socket) user.socket.send(data);
    });
  }

  updateCoords(SPEED) {
    for (let i = 0; i < 2; i++) {
      this.playerY[i] += this.playerCoords[i] * SPEED;
      this.playerY[i] = Math.max(0, Math.min(340, this.playerY[i]));
    }
  }

  resetBall(direction = -1) {
    this.ball.x = 300;
    this.ball.y = 200;
    this.ball.vx = 4 * direction;
    this.ball.vy = Math.random() > 0.5 ? 3 : -3;
  }

  updateBall() {
    const { size } = this.ball;
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    if (this.ball.y <= 0 || this.ball.y + size >= 400) {
      this.ball.vy *= -1;
      this.ball.y = Math.max(0, Math.min(400 - size, this.ball.y));
    }

    // Left paddle collision
    if (
      this.ball.x <= 20 &&
      this.ball.y + size >= this.playerY[0] &&
      this.ball.y <= this.playerY[0] + 60
    ) {
      this.ball.vx = Math.abs(this.ball.vx);
      this.ball.x = 20;
    }

    // Right paddle collision
    if (
      this.ball.x + size >= 580 &&
      this.ball.y + size >= this.playerY[1] &&
      this.ball.y <= this.playerY[1] + 60
    ) {
      this.ball.vx = -Math.abs(this.ball.vx);
      this.ball.x = 580 - size;
    }

    // Miss: reset to center heading toward scorer
    if (this.ball.x < -size) this.resetBall(1);
    if (this.ball.x > 600 + size) this.resetBall(-1);
  }

  updateAIMove() {
    if (!this.isAIMatch || this.playerY[1] === null) return;

    const diff = this.playerY[0] - this.playerY[1];
    if (Math.abs(diff) < 8) {
      this.playerCoords[1] = 0;
      return;
    }
    this.playerCoords[1] = diff > 0 ? 1 : -1;
  }

  sendState(SPEED) {
    if (this.isAIMatch) this.updateAIMove();
    this.updateCoords(SPEED);
    this.updateBall();
    this.broadcast({
      type: "MOVE",
      playerY1: this.playerY[0],
      playerY2: this.playerY[1],
      ballX: this.ball.x,
      ballY: this.ball.y,
    });
  }

  setPlayerMove(user, moveDir) {
    const i = this.players.indexOf(user);
    if (i === -1) return;

    if (moveDir === "MOVE_UP") this.playerCoords[i] = -1;
    else if (moveDir === "MOVE_DOWN") this.playerCoords[i] = 1;
    else if (moveDir === "STOP") this.playerCoords[i] = 0;
  }

  end() {
    this.isActive = false;
    this.players.forEach((player) => player.disconnect());
  }
}

module.exports = Match;
