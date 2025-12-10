
import {texture, canvas} from "./ui.js"


interface GameScreen {
    WIDTH: number;
    HEIGHT: number;
    MID_HEIGHT: number;
    MID_WIDTH: number;
};

interface GamePaddle {
    HEIGHT: number;
    WIDTH: number;
    OFFSET: number;
    SPEED: number;
};

interface GameBall {
    HEIGHT: number;
    WIDTH: number;
    OFFSET: number;
    SPEED: number;
    Y: number;
    X: number;
    YCoord: number;
    XCoord: number;
};

interface GamePlayer {
    Y: number[];
    X: number[];
    YCoord: number;
};

const screen: GameScreen = {

    WIDTH: canvas.width,
    HEIGHT: canvas.height,
    MID_HEIGHT: canvas.height / 2,
    MID_WIDTH: canvas.width / 2
};
 
const ball: GameBall = {
    HEIGHT: 10,
    WIDTH: 10,
    OFFSET: 10 / 2,
    SPEED: 2,
    Y: screen.MID_HEIGHT,
    X: screen.MID_WIDTH,
    YCoord: 0,
    XCoord: 0
};

const paddle: GamePaddle = {
    HEIGHT: 60,
    WIDTH: 10,
    OFFSET: 60 / 2,
    SPEED: 5,
};


const player1: GamePlayer = {
    Y: [screen.MID_HEIGHT - paddle.OFFSET, screen.MID_HEIGHT + paddle.OFFSET],
    X: [20, 20],
    YCoord: 0

};

const player2: GamePlayer = {

    Y: [screen.MID_HEIGHT - paddle.OFFSET, screen.MID_HEIGHT + paddle.OFFSET],
    X: [screen.WIDTH - 20, screen.WIDTH - 20],
    YCoord: 0
};



function updatePlayers(): void {

    player1.Y[0] += player1.YCoord * paddle.SPEED;
    player1.Y[1] += player1.YCoord * paddle.SPEED;
    player2.Y[0] += player2.YCoord * paddle.SPEED;
    player2.Y[1] += player2.YCoord * paddle.SPEED;



	if (player1.Y[1] >= screen.HEIGHT) {
        player1.Y[1] = screen.HEIGHT;
        player1.Y[0] = screen.HEIGHT - paddle.HEIGHT;
    }
	if (player2.Y[1] >= screen.HEIGHT) {
        player2.Y[0] = screen.HEIGHT - paddle.HEIGHT;
        player2.Y[1] = screen.HEIGHT;
    }

	if (player1.Y[0] <= 0) {
        player1.Y[0] = 0;  
        player1.Y[1] = 0 + paddle.HEIGHT;
    }
    if (player2.Y[0] <= 0) {
        player2.Y[0] = 0;  
        player2.Y[1] = 0 + paddle.HEIGHT;
    }

}

function updateBall(): void {

    const RIGHT_PADDLE_HITBOX: number = player2.X[0];
    const LEFT_PADDLE_HITBOX: number = player1.X[0];

    
    if (ball.X - ball.OFFSET <= LEFT_PADDLE_HITBOX) {

        if (ball.Y + ball.OFFSET >= player1.Y[0] && ball.Y - ball.OFFSET <= player1.Y[1]) {

            ball.XCoord += ball.SPEED;
        }
    }
    else if (ball.X + ball.OFFSET >= RIGHT_PADDLE_HITBOX) {

        if (ball.Y + ball.OFFSET >= player2.Y[0] && ball.Y - ball.OFFSET <= player2.Y[1]) {

            ball.XCoord -= ball.SPEED;
        }
    }
    ball.X  += ball.XCoord
}

export function gameKeyPresses() {

    ball.XCoord = 1;
    document.addEventListener("keydown", (e: KeyboardEvent) => {

        if (e.key === "w")
            player1.YCoord = -1
        if (e.key === "s")
			player1.YCoord  = 1;
        if (e.key === "ArrowUp")
			player2.YCoord  = -1;
        if (e.key === "ArrowDown")
			player2.YCoord  = 1;
    });
    document.addEventListener("keyup", (e: KeyboardEvent) => {

        if (e.key === "w" || e.key === "s")
            player1.YCoord = 0;
        if (e.key === "ArrowUp" || e.key === "ArrowDown")
            player2.YCoord= 0;
    });
	gameLoop();
}


function drawAll() {

    // CLEAR SCREEN
	texture.clearRect(0, 0, screen.WIDTH, screen.HEIGHT);
	texture.fillStyle = "black";
	texture.fillRect(0, 0, screen.WIDTH, screen.HEIGHT);


    // LEFT PADDLE
    texture.fillStyle = "white";
    texture.fillRect(player1.X[0], player1.Y[0], -paddle.WIDTH, paddle.HEIGHT);

    // RIGHT PADDLE
    texture.fillStyle = "white";
    texture.fillRect(player2.X[0], player2.Y[0], paddle.WIDTH, paddle.HEIGHT);

    // BALL
    texture.fillStyle = "pink";
	texture.fillRect((ball.X - ball.OFFSET), (ball.Y - ball.OFFSET), ball.WIDTH, ball.HEIGHT)
}

function drawHitboxes() {

    // PLAYER END HITBOXES
    texture.fillStyle = "green";
	texture.fillRect(player1.X[0] + 10, player1.Y[0], paddle.WIDTH, paddle.WIDTH);
	texture.fillRect(player2.X[0] - 10, player2.Y[0], -paddle.WIDTH, paddle.WIDTH);


    // ACTUAL PLAYER CENTER
    texture.fillStyle = "blue";
	texture.fillRect(player1.X[0] + 10, ((player1.Y[0] + player1.Y[1]) / 2) - 5, 10, 10);
	texture.fillRect(player2.X[0] - 20, ((player2.Y[0] + player2.Y[1]) / 2) - 5, 10, 10);

    texture.fillStyle = "red";
    texture.fillRect(player1.X[1] + 10, player1.Y[1], -paddle.WIDTH, -paddle.WIDTH);
    texture.fillRect(player2.X[1] - 10, player2.Y[1], paddle.WIDTH, -paddle.WIDTH);
}

function gameLoop() {
	updatePlayers();
    updateBall();
	drawAll();
    // drawHitboxes();
	requestAnimationFrame(gameLoop);
}

