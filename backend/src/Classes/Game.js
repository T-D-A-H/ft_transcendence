
class Game {

    static _screen   = { WIDTH: 600, HEIGHT: 400, MID_HEIGHT: (400 / 2), MID_WIDTH: (600 / 2 )};
	static _paddle   = { HEIGHT: 60, WIDTH: 10, OFFSET: (60 / 2), SPEED: 5, CHUNKS: (60 / 26), MID_HEIGHT: (60 / 2) };
	static _ball = { HEIGHT: 10, WIDTH: 10, OFFSET: (10 / 2), SPEED: 2 };
    static _player  = {
        P0_START_POS: 30, P1_START_POS: (Game._screen.WIDTH - 20),
        P0_DIR: 1, P1_DIR: -1,
        P0_Y0: (Game._screen.MID_HEIGHT - Game._paddle.OFFSET), P0_Y1: (Game._screen.MID_HEIGHT + Game._paddle.OFFSET), 
        P1_Y0: (Game._screen.MID_HEIGHT - Game._paddle.OFFSET), P1_Y1: (Game._screen.MID_HEIGHT + Game._paddle.OFFSET), 
        P0_X0: 10, P0_X1: 20,
        P1_X0: (Game._screen.WIDTH - 30), P1_X1: (Game._screen.WIDTH - 20)
    };


    constructor() {

        this.SCORES = [0, 0];
	    this.ball = {
	    	HEIGHT: Game._ball.HEIGHT,
	    	WIDTH: Game._ball.WIDTH,
	    	OFFSET: Game._ball.OFFSET,
	    	SPEED: Game._ball.SPEED,
	    	Y: Game._screen.MID_HEIGHT,
	    	X: Game._screen.MID_WIDTH,
	    	YDir: 0,
	    	XDir: 0
	    };
        this.leftPlayer = {
            DIR: Game._player.P0_DIR,
            START: Game._player.P0_START_POS,
            Y: [Game._player.P0_Y0, Game._player.P0_Y1],
            X: [Game._player.P0_X0, Game._player.P0_X1],
            YDir: 0
        };
        this.rightPlayer = {
            DIR: Game._player.P1_DIR,
            START: Game._player.P1_START_POS,
            Y: [Game._player.P1_Y0, Game._player.P1_Y1],
            X: [Game._player.P1_X0, Game._player.P1_X1],
            YDir: 0
        };
    }


    restartGame(player) {

        this.leftPlayer.X = [Game._player.Y0, Game._player.Y1];
        this.leftPlayer.Y = [Game._player.X0, Game._player.X0];
        this.leftPlayer.YDir = 0;
        this.rightPlayer.X = [Game._player.Y0, Game._player.Y1];
        this.rightPlayer.Y = [Game._player.X1, Game._player.X1];
        this.rightPlayer.YDir = 0;
        this.ball.X  = player.START;
        this.ball.Y  = Game._screen.MID_HEIGHT;
        this.ball.XDir = player.DIR;
        this.ball.YDir = 0;
    }

    updatePlayerPaddle(playerIndex, newYCoord) {

        const player = (playerIndex === 0) ? this.leftPlayer : this.rightPlayer;
        
        player.Y[0] += newYCoord * Game._paddle.SPEED;
        player.Y[1] += newYCoord * Game._paddle.SPEED;

	    if (player.Y[1] >= Game._screen.HEIGHT) {
            player.Y[0] = Game._screen.HEIGHT - Game._paddle.HEIGHT;
            player.Y[1] = Game._screen.HEIGHT;
        }
	    if (player.Y[0] <= 0) {
            player.Y[0] = 0;  
            player.Y[1] = Game._paddle.HEIGHT;
        }
    }

    updateBall() {

        if (this.leftPaddleHitBall()) {
        
            this.ball.YDir += getPaddleHitAngle(this.leftPlayer);
            this.ball.XDir += Game._ball.SPEED;
        }
        else if (this.rightPaddleHitBall()) {
        
            this.ball.YDir -= getPaddleHitAngle(this.rightPlayer);
            this.ball.XDir -= Game._ball.SPEED;
        
        }
        else if (this.ballWentThrough()) {

            const player = this.getPlayerWhoSCORESd();
            this.SCORES[player.INDEX]++;
            this.restartGame(player);
        }
        else if (this.ballBouncedOnWall()) {

            this.ball.YDir = -this.ball.YDir;
        }
        this.ball.X  += this.ball.XDir;
        this.ball.Y  += this.ball.YDir;
    }

    ballBouncedOnWall() {

        if (this.ball.Y + this.ball.OFFSET >= Game._screen.HEIGHT || this.ball.Y - this.ball.OFFSET <= 0) {
            return (true);
        }
        return (false);
    }

    ballWentThrough() {

        if (this.ball.X - this.ball.OFFSET <= 0 || this.ball.X + this.ball.OFFSET >= Game._screen.WIDTH) {
            return (true);
        }
        return (false);
    }

    getPlayerWhoSCORESd() {

        if (this.ball.X + this.ball.OFFSET >= Game._screen.WIDTH) {
            return (this.leftPlayer);
        }
        return (this.rightPlayer);
    }

    leftPaddleHitBall() {

        if (ball.X - ball.OFFSET <= this.leftPlayer.X[1] && ball.Y + ball.OFFSET >= leftPlayer.Y[0] && ball.Y - ball.OFFSET <= leftPlayer.Y[1]) {
            return (true);
        }
        return (false);
    }

    rightPaddleHitBall() {

        if (ball.X + ball.OFFSET >= this.rightPlayer.X[0] && ball.Y + ball.OFFSET >= this.rightPlayer.Y[0] && ball.Y - ball.OFFSET <= this.rightPlayer.Y[1]) {
            return (true);
        }
        return (false);
    }

    getPaddleHitAngle(player) {

        const relative_y = this.ball.Y - player.Y[0];
        const cur_chunk = Math.floor(relative_y / Game._paddle.CHUNKS);
        const new_dir = (cur_chunk / 10);

        if (cur_chunk < Game._paddle.MID_HEIGHT) {
            return (-new_dir)
        }
        return (new_dir);     
    }

    getLeftPlayerXY() {return ([this.leftPlayer.X[0], this.leftPlayer.Y[0] - Game._paddle.WIDTH]);}
    getRightPlayerXY() {return ([this.rightPlayer.X[0], this.rightPlayer.Y[0]]);}
    getBallXY() {return ([this.ball.X - Game._ball.OFFSET, this.ball.Y - Game._ball.OFFSET]);}


    getPaddleWidthAndHeight() {return ([Game._paddle.WIDTH, Game._paddle.HEIGHT]);}
    getBallWidthAndHeight() {return ([Game._ball.WIDTH, Game._ball.HEIGHT]);}
    getScores() {return (this.SCORES);}

}
