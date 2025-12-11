

function drawBall(texture: CanvasRenderingContext2D, y: number, x: number) {

	texture.fillStyle = "white";
	texture.fillRect(x, y, 10, 10)
	return;
}

function drawBrackground(canvas: HTMLCanvasElement, texture: CanvasRenderingContext2D) {

	texture.clearRect(0, 0, canvas.width, canvas.height);
	texture.fillStyle = "black";
	texture.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayerOne(texture: CanvasRenderingContext2D, y: number, x: number) {
    
	texture.fillStyle = "white";
	texture.fillRect(x, y, 10, 60);
}

function drawPlayerTwo(texture: CanvasRenderingContext2D, y: number, x: number) {

	texture.fillStyle = "white";
	texture.fillRect(x, y, 10, 60);
}

export function drawGame( canvas: HTMLCanvasElement, texture: CanvasRenderingContext2D, leftX: number, leftY: number, rightX: number, rightY: number, ballX: number, ballY: number) {

	drawBrackground(canvas, texture);
	drawPlayerOne(texture, leftY, leftX);
	drawPlayerTwo(texture, rightY, rightX);
	drawBall(texture, ballY, ballX);
}

