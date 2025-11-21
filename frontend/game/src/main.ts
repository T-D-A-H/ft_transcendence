import { drawBrackground, drawPlayerOne, drawPlayerTwo } from "./draw.js";
import { keyPressEvents } from "./keypress.js";
import { vars, PaddleState } from "./vars.js";

interface StateMessage {type: "STATE"; playerY1: number; playerY2: number;}

type ServerMessage = StateMessage;

const canvas = document.getElementById("game") as HTMLCanvasElement;
if (!canvas) {
	console.error("Could not find canvas element");
	throw new Error("Canvas not found");
}
const paddle  = canvas.getContext("2d") as CanvasRenderingContext2D;

const socket = new WebSocket("ws://localhost:4000/proxy-pong");
socket.onopen = () => console.log("Coonnected to WebSocket");
socket.onerror = (error: Event) => console.error("Error Connecting to WebSocket:", error);

keyPressEvents(socket);

// Recibir estado del servidor
socket.onmessage = (msg : MessageEvent) => {
	try {
		const data: ServerMessage = JSON.parse(msg.data);
		console.log("Data Received:", data);
		if (data.type === "STATE") {
			vars.paddle1.y = data.playerY1;
			vars.paddle2.y = data.playerY2;
		}

	} catch (error) {
		console.error("Error parsing message:", error);
	}
};


function drawLoop(): void {
	drawBrackground(vars.backgroundColour, canvas, paddle);
	drawPlayerOne(vars.paddle1.colour, paddle, vars.paddle1.y, vars.paddle1.x);
	drawPlayerTwo(vars.paddle1.colour, paddle, vars.paddle2.y, vars.paddle2.x);
	requestAnimationFrame(drawLoop);
}

drawLoop();