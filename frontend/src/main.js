import { drawBrackground } from "./draw.js";
import { drawPlayerOne } from "./draw.js";
import { drawPlayerTwo } from "./draw.js";
import { keyPressEvents } from "./keypress.js";
import { vars } from "./vars.js";

const canvas = document.getElementById("game");
const paddle  = canvas.getContext("2d");
const socket = new WebSocket("ws://localhost:3000/ws");


socket.onopen = () => {
	console.log("Conectado al servidor WebSocket");
};

socket.onerror = (error) => {
	console.error("Error de conexión WebSocket:", error);
};


keyPressEvents(socket);

// Recibir estado del servidor
socket.onmessage = (msg) => {

	try {

		const data = JSON.parse(msg.data);
		console.log("Datos recibidos:", data);
		if (data.type === "STATE") {
			vars.paddle1.y = data.playerY1;
			vars.paddle2.y = data.playerY2;
		}

	} catch (error) {
		console.error("Error parsing message:", error);
	}
};
//{ STATE: 'STOP_1' }

function drawLoop() {

	drawBrackground(vars.backgroundColour, canvas, paddle);
	drawPlayerOne(vars.paddle1.colour, paddle, vars.paddle1.y, vars.paddle1.x);
	drawPlayerTwo(vars.paddle1.colour, paddle, vars.paddle2.y, vars.paddle2.x);
	requestAnimationFrame(drawLoop);
}

if (canvas) {
	drawLoop();
}
else {
	console.error("❌ No se encontró el elemento canvas");
}