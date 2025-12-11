import { texture, canvas } from "./ui.js";

export function drawGame(leftX: number, leftY: number, rightX: number, rightY: number, ballX: number, ballY: number) {

	
	texture.clearRect(0, 0, canvas.width, canvas.height);

	texture.fillStyle = "black";
	texture.fillRect(0, 0, canvas.width, canvas.height);

	texture.fillStyle = "white";
	texture.fillRect(leftX, leftY, 10, 60);

	texture.fillStyle = "white";
	texture.fillRect(rightX, rightY, 10, 60);


	texture.fillStyle = "white";
	texture.fillRect(ballX, ballY, 10, 10);

	texture.fillStyle = "white";
	const dashHeight = 10;
	const dashGap = 5;
	const lineWidth = 5; 
	const centerX = canvas.width / 2 - lineWidth / 2;
	
	for (let y = 0; y < canvas.height; y += dashHeight + dashGap) {
		texture.fillRect(centerX, y, lineWidth, dashHeight);
	}

}


