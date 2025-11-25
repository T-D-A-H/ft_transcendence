import { drawBrackground, drawPlayerOne, drawPlayerTwo } from "./draw.js";
import { keyPressEvents } from "./keypress.js";
import { vars } from "./vars.js";

// Get canvas element
const canvas = document.getElementById("game") as HTMLCanvasElement;
if (!canvas) {
    throw new Error("Canvas element not found");
}

const loginButton = document.getElementById("loginButton") as HTMLButtonElement;
const registerButton = document.getElementById("registerButton") as HTMLButtonElement;

loginButton.addEventListener("click", () => {
    window.location.href = "/login";
});

registerButton.addEventListener("click", () => {
    window.location.href = "/register";
});

const ctx = canvas.getContext("2d");
if (!ctx) {
    throw new Error("Could not get 2D context");
}

// Connect to WebSocket
const socket = new WebSocket("ws://localhost:4000/proxy-pong");

socket.addEventListener("open", () => {
    console.log("Connected to game server");
});

socket.addEventListener("message", (event) => {
    try {
        const data = JSON.parse(event.data);

        if (data.type === "STATE") {
            // Update paddle positions from server
            vars.paddle1.y = data.playerY1;
            vars.paddle2.y = data.playerY2;

            // Redraw the game
            drawBrackground(vars.backgroundColour, canvas, ctx);
            drawPlayerOne(vars.paddle1.colour, ctx, vars.paddle1.y, vars.paddle1.x);
            drawPlayerTwo(vars.paddle2.colour, ctx, vars.paddle2.y, vars.paddle2.x);
        }
    } catch (error) {
        console.error("Error parsing message:", error);
    }
});

socket.addEventListener("close", () => {
    console.log("Disconnected from game server");
});

socket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
});

// Setup keyboard controls
keyPressEvents(socket);

// Initial draw
drawBrackground(vars.backgroundColour, canvas, ctx);
drawPlayerOne(vars.paddle1.colour, ctx, vars.paddle1.y, vars.paddle1.x);
drawPlayerTwo(vars.paddle2.colour, ctx, vars.paddle2.y, vars.paddle2.x);