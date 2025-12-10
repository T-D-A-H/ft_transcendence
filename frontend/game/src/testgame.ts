
import {texture, canvas} from "./ui.js"


interface GameScreen {
    WIDTH: number;
    HEIGHT: number;
};

interface GamePaddle {
    HEIGHT: number;
    WIDTH: number;
    UP_OFFSET: number;
    DOWN_OFFSET: number;
    SPEED: number;
};

interface GameBall {
    HEIGHT: number;
    WIDTH: number;
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
    HEIGHT: canvas.height
};
 
const ball: GameBall = {
    HEIGHT: 10,
    WIDTH: 10,
    SPEED: 2,
    Y: (screen.HEIGHT / 2),
    X: (screen.WIDTH / 2),
    YCoord: 0,
    XCoord: 1
};

const paddle: GamePaddle = {
    HEIGHT: 60,
    WIDTH: 10,
    UP_OFFSET: 30,
    DOWN_OFFSET: 10,
    SPEED: 5,
};


const player1: GamePlayer = {
    Y: [(screen.HEIGHT / 2) - paddle.UP_OFFSET, (screen.HEIGHT / 2) + paddle.UP_OFFSET],
    X: [paddle.WIDTH, paddle.WIDTH + paddle.WIDTH],
    YCoord: 0

};
const player2: GamePlayer = {

    Y: [(screen.HEIGHT / 2) - paddle.UP_OFFSET, (screen.HEIGHT / 2) + paddle.UP_OFFSET],
    X: [screen.WIDTH - paddle.WIDTH, screen.WIDTH - paddle.WIDTH - paddle.WIDTH],
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

    const LEFT_PADDLE_HITBOX: number = player1.X[1];
    const RIGHT_PADDLE_HITBOX: number = player2.X[0];


    // ball.X = LEFT_PADDLE_HITBOX;
    if (ball.X >= LEFT_PADDLE_HITBOX)
        ball.XCoord -= ball.SPEED;
    else if (ball.X >= RIGHT_PADDLE_HITBOX)
        ball.XCoord -= ball.SPEED;
    // if (ball.Y >= paddle1.Y[0] && ball.Y <= paddle1.Y[1]) {


    // }
    // else if (ball.Y >= paddle2.Y[0] && ball.Y <= paddle2.Y[1]) {


    // }

    ball.X  += ball.XCoord

}


export function gameKeyPresses() {

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
    texture.fillRect(player1.X[0], player1.Y[0], paddle.WIDTH, paddle.UP_OFFSET);
    texture.fillStyle = "white";
    texture.fillRect(player1.X[1], player1.Y[1], -paddle.WIDTH, -paddle.UP_OFFSET);

    // RIGHT PADDLE
    texture.fillStyle = "white";
    texture.fillRect(player2.X[0], player2.Y[0], -paddle.WIDTH, paddle.UP_OFFSET);
    texture.fillStyle = "white";
    texture.fillRect(player2.X[1], player2.Y[1], paddle.WIDTH, -paddle.UP_OFFSET);


    // BALL
    texture.fillStyle = "white";
	texture.fillRect(ball.X, ball.Y, ball.WIDTH, ball.HEIGHT)
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
    drawHitboxes();
	requestAnimationFrame(gameLoop);
}

