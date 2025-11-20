
export function drawBrackground(colour: string, canvas: HTMLCanvasElement, paddle: CanvasRenderingContext2D) {

	paddle.clearRect(0, 0, canvas.width, canvas.height);
	paddle.fillStyle = colour;
	paddle.fillRect(0, 0, canvas.width, canvas.height);
}

export function drawPlayerOne(colour: string, paddle: CanvasRenderingContext2D, y: number, x: number) {
    
	paddle.fillStyle = colour;
	paddle.fillRect(x, y, 10, 60);
}

export function drawPlayerTwo(colour: string, paddle: CanvasRenderingContext2D, y: number, x: number) {

	paddle.fillStyle = colour;
	paddle.fillRect(x, y, 10, 60);
}
