import {texture, canvas, pongFont, whitish, blackish, drawCrtOverlay} from "./ui.js";
import { SCORES } from "./vars.js";



export async function drawScores(SCORES: number[]) {

	await pongFont;
	texture.fillStyle = blackish;
	texture.textAlign = "center";
	texture.textBaseline = "top";
	texture.font = "48px BlockFont";

	texture.fillText(SCORES[0].toString(), canvas.width / 4, 20);
	texture.fillText(SCORES[1].toString(), (canvas.width / 4) * 3, 20);
}


function drawDottedLine() {

	texture.fillStyle = blackish;
	const dashHeight = 10;
	const dashGap = 5;
	const lineWidth = 5; 
	const centerX = canvas.width / 2 - lineWidth / 2;
	
	for (let y = 0; y < canvas.height; y += dashHeight + dashGap) {

		texture.fillRect(centerX, y, lineWidth, dashHeight);
	}
}

export function clearBackground() {

	texture.clearRect(0, 0, canvas.width, canvas.height);
	texture.fillStyle = whitish;
	texture.fillRect(0, 0, canvas.width, canvas.height);
}

export function drawGame(leftX: number = 10, leftY: number = 170, rightX: number = 580, rightY: number = 170, ballX: number = 900, ballY: number = 900) {

	clearBackground();

	texture.fillStyle = blackish;
	texture.fillRect(leftX, leftY, 10, 60);

	texture.fillStyle = blackish;
	texture.fillRect(rightX, rightY, 10, 60);

	texture.fillStyle = blackish;
	texture.fillRect(ballX, ballY, 10, 10);

	drawDottedLine();

	drawScores(SCORES);
}


export function drawFrame() {

    drawCrtOverlay();
}