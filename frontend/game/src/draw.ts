import { texture, canvas, pongFont, SCORES } from "./ui.js";


export async function drawWin(winMsg: string) {

	await pongFont;
	clearBackground();

	texture.fillStyle = "white";
	texture.textAlign = "center";
	texture.textBaseline = "top";
	texture.font = "24px BlockFont";

	texture.fillText(winMsg, 0, 0);
}

export async function drawScores(SCORES: number[]) {

	await pongFont;
	texture.fillStyle = "white";
	texture.textAlign = "center";
	texture.textBaseline = "top";
	texture.font = "48px BlockFont";

	texture.fillText(SCORES[0].toString(), canvas.width / 4, 20);
	texture.fillText(SCORES[1].toString(), (canvas.width / 4) * 3, 20);
}

function drawDottedLine() {

	texture.fillStyle = "white";
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
	texture.fillStyle = "black";
	texture.fillRect(0, 0, canvas.width, canvas.height);
}

export function drawGame(leftX: number, leftY: number, rightX: number, rightY: number, ballX: number, ballY: number) {

	
	clearBackground();

	texture.fillStyle = "white";
	texture.fillRect(leftX, leftY, 10, 60);

	texture.fillStyle = "white";
	texture.fillRect(rightX, rightY, 10, 60);


	texture.fillStyle = "white";
	texture.fillRect(ballX, ballY, 10, 10);

	drawDottedLine();
	drawScores(SCORES);
}


