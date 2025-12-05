

function drawBall(paddle: CanvasRenderingContext2D, y: number, x: number) {

	paddle.fillStyle = "white";
	paddle.fillRect(x, y, 10, 10)
	return;
}

function drawBrackground(canvas: HTMLCanvasElement, paddle: CanvasRenderingContext2D) {

	paddle.clearRect(0, 0, canvas.width, canvas.height);
	paddle.fillStyle = "black";
	paddle.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayerOne(paddle: CanvasRenderingContext2D, y: number, x: number) {
    
	paddle.fillStyle = "white";
	paddle.fillRect(x, y, 10, 60);
}

function drawPlayerTwo(paddle: CanvasRenderingContext2D, y: number, x: number) {

	paddle.fillStyle = "white";
	paddle.fillRect(x, y, 10, 60);
}

export function drawGame(canvas: HTMLCanvasElement, paddle: CanvasRenderingContext2D, p1Y: number, bY: number, bX: number, p2Y: number) {

	drawBrackground(canvas, paddle);
	drawPlayerOne(paddle, p1Y, 10);
	drawPlayerTwo(paddle, p2Y, canvas.width - 20);
	drawBall(paddle, (canvas.height / 2) + bY, (canvas.width / 2) + bX);
}

