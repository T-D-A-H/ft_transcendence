
const LOGGER = require("../LOGGER.js");

class Game {

    static MaxScore = 8;
    static Screen = { 
        WIDTH: 600, 
        HEIGHT: 400, 
        MID_HEIGHT: (400 / 2), 
        MID_WIDTH: (600 / 2)
    };
	static Paddle = { 
        HEIGHT: 60, 
        WIDTH: 10, 
        OFFSET: (60 / 2), 
        SPEED: 8, 
        CHUNKS: (60 / 12),
        MID_HEIGHT: (60 / 2) 
    };
	static Ball = { 
        HEIGHT: 10, 
        WIDTH: 10, 
        OFFSET: (10 / 2),
        SPEED: 3,
        INC: 0.25,
        MAX_SPEED: 6,
        START_POS: [30 , (Game.Screen.WIDTH - 30)]
    };
    static Player0  = {
        Y0: (Game.Screen.MID_HEIGHT - Game.Paddle.OFFSET),
        Y1: (Game.Screen.MID_HEIGHT + Game.Paddle.OFFSET), 
        X0: 10,
        X1: 20
    };
    static Player1  = {
        Y0: (Game.Screen.MID_HEIGHT - Game.Paddle.OFFSET), 
        Y1: (Game.Screen.MID_HEIGHT + Game.Paddle.OFFSET), 
        X0: (Game.Screen.WIDTH - 20), 
        X1: (Game.Screen.WIDTH - 10)
    };


    constructor() {

        LOGGER(200, "Game", "Constructor", "called.");
        this.SCORES = [0, 0];
	    this.ball = {
            SPEED: Game.Ball.SPEED,
	    	Y: Game.Screen.MID_HEIGHT,
	    	X: Game.Screen.MID_WIDTH,
	    	YDir: 0,
	    	XDir: 1
	    };
        this.leftPlayer = {
            INDEX: 0,
            DIR: 1,
            Y: [Game.Player0.Y0, Game.Player0.Y1],
            X: [Game.Player0.X0, Game.Player0.X1],
            YDir: 0
        };
        this.rightPlayer = {
            INDEX: 1,
            DIR: -1,
            Y: [Game.Player1.Y0, Game.Player1.Y1],
            X: [Game.Player1.X0, Game.Player1.X1],
            YDir: 0
        };
    }


    restartGame() {
        
        const player = this.getPlayerWhoScored();
        this.SCORES[player.INDEX]++;

        this.leftPlayer.Y = [Game.Player0.Y0, Game.Player0.Y1];
        this.leftPlayer.YDir = 0;
        this.rightPlayer.Y = [Game.Player1.Y0, Game.Player1.Y1];
        this.rightPlayer.YDir = 0;
        this.ball.Y  = Game.Screen.MID_HEIGHT;
        this.ball.X  = Game.Ball.START_POS[player.INDEX];
        this.ball.XDir = player.DIR;
        this.ball.YDir = 0;
        this.ball.SPEED = Game.Ball.SPEED;
        LOGGER(200, "Game", "restartGame", "SCORES: " + this.SCORES[0] + ", " + this.SCORES[1]);
    }

    updatePlayerPaddle(newYDir) {

        this.leftPlayer.Y[0]  += newYDir[0] * Game.Paddle.SPEED;
        this.leftPlayer.Y[1]  += newYDir[0] * Game.Paddle.SPEED;
        this.rightPlayer.Y[0] += newYDir[1] * Game.Paddle.SPEED;
        this.rightPlayer.Y[1] += newYDir[1] * Game.Paddle.SPEED;

	    if (this.leftPlayer.Y[1] >= Game.Screen.HEIGHT) {
            this.leftPlayer.Y[0] = Game.Screen.HEIGHT - Game.Paddle.HEIGHT;
            this.leftPlayer.Y[1] = Game.Screen.HEIGHT;
        }
        if (this.rightPlayer.Y[1] >= Game.Screen.HEIGHT) {
            this.rightPlayer.Y[0] = Game.Screen.HEIGHT - Game.Paddle.HEIGHT;
            this.rightPlayer.Y[1] = Game.Screen.HEIGHT;
        }
	    if (this.leftPlayer.Y[0] <= 0) {
            this.leftPlayer.Y[0] = 0;  
            this.leftPlayer.Y[1] = Game.Paddle.HEIGHT;
        }

	    if (this.rightPlayer.Y[0] <= 0) {
            this.rightPlayer.Y[0] = 0;  
            this.rightPlayer.Y[1] = Game.Paddle.HEIGHT;
        }
    }

    updateBall() {

        if (this.leftPaddleHitBall()) {
        
            const angle = this.getPaddleHitAngle(this.leftPlayer);
            this.ball.SPEED += Game.Ball.INC;
            if (this.ball.SPEED > Game.Ball.MAX_SPEED)
                this.ball.SPEED = Game.Ball.MAX_SPEED;
            this.ball.XDir = 1; 
            this.ball.YDir = angle * this.ball.SPEED;
        }
        else if (this.rightPaddleHitBall()) {

            const angle = this.getPaddleHitAngle(this.rightPlayer);
            this.ball.SPEED += Game.Ball.INC;
            if (this.ball.SPEED > Game.Ball.MAX_SPEED)
                this.ball.SPEED = Game.Ball.MAX_SPEED;
            this.ball.XDir = -1; 
            this.ball.YDir = angle * this.ball.SPEED;
        
        }
        else if (this.ballWentThrough()) {

            this.restartGame();
            return ;
        }
        else if (this.ballBouncedOnWall()) {

            this.ball.YDir = -this.ball.YDir;
        }
        this.ball.X  += this.ball.XDir * this.ball.SPEED;
        this.ball.Y  += this.ball.YDir;
    }

    ballBouncedOnWall() {

        if (this.ball.Y + Game.Ball.OFFSET >= Game.Screen.HEIGHT || this.ball.Y - Game.Ball.OFFSET <= 0) {
            return (true);
        }
        return (false);
    }

    ballWentThrough() {

        if (this.ball.X - Game.Ball.OFFSET <= 0 || this.ball.X + Game.Ball.OFFSET >= Game.Screen.WIDTH) {
            return (true);
        }
        return (false);
    }

    getPlayerWhoScored() {

        if (this.ball.X + Game.Ball.OFFSET >= Game.Screen.WIDTH) {
            return (this.leftPlayer);
        }
        return (this.rightPlayer);
    }

    leftPaddleHitBall() {

        if (this.ball.X - Game.Ball.OFFSET <= this.leftPlayer.X[1] && this.ball.Y + Game.Ball.OFFSET >= this.leftPlayer.Y[0] && this.ball.Y - Game.Ball.OFFSET <= this.leftPlayer.Y[1]) {
            return (true);
        }
        return (false);
    }

    rightPaddleHitBall() {

        if (this.ball.X + Game.Ball.OFFSET >= this.rightPlayer.X[0] && this.ball.Y + Game.Ball.OFFSET >= this.rightPlayer.Y[0] && this.ball.Y - Game.Ball.OFFSET <= this.rightPlayer.Y[1]) {
            return (true);
        }
        return (false);
    }
    
    getPaddleHitAngle(player) {

    	const paddle_center = (player.Y[0] + player.Y[1]) / 2;
    	const ball_center = this.ball.Y + Game.Ball.OFFSET;

    	const relative = ball_center - paddle_center;
    	const normalized = relative / ((player.Y[1] - player.Y[0]) / 2);

    	return normalized;
    }


    getLeftPlayerXY() {return ([this.leftPlayer.X[0], this.leftPlayer.Y[0]]);}
    getRightPlayerXY() {return ([this.rightPlayer.X[0], this.rightPlayer.Y[0]]);}
    getBallXY() {return ([this.ball.X - Game.Ball.OFFSET, this.ball.Y - Game.Ball.OFFSET]);}


    getPaddleWidthAndHeight() {return ([Game.Paddle.WIDTH, Game.Paddle.HEIGHT]);}
    getBallWidthAndHeight() {return ([Game.Ball.WIDTH, Game.Ball.HEIGHT]);}
    getScores() {return (this.SCORES);}
    getIfWin() {
        if (this.SCORES[0] >= Game.MaxScore)
            return (0);
        else if (this.SCORES[1] >= Game.MaxScore)
            return (1);
        return (-1);
    }

}

module.exports = Game;
