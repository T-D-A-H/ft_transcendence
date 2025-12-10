

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

export function drawGame(canvas: HTMLCanvasElement, texture: CanvasRenderingContext2D, p1Y: number, bY: number, bX: number, p2Y: number) {

	drawBrackground(canvas, texture);
	drawPlayerOne(texture, p1Y, 10);
	drawPlayerTwo(texture, p2Y, canvas.width - 20);
	drawBall(texture, (canvas.height / 2) + bY, (canvas.width / 2) + bX);
}

