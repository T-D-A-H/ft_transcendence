
interface MoveMessage  {type: "MOVE"; playerY1: number; playerY2: number;};
type ServerMessage = MoveMessage;

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


export function drawGame(userSocket: WebSocket, canvas: HTMLCanvasElement, paddle: CanvasRenderingContext2D): void {
	
	userSocket.onmessage = (event: MessageEvent) => {
		try {
			const data: ServerMessage = JSON.parse(event.data);

			if (data.type === "MOVE") {
				drawBrackground(canvas, paddle);
				drawPlayerOne(paddle, data.playerY1, 10);
				drawPlayerTwo(paddle, data.playerY2, canvas.width - 20);
			}
		} catch (err) {
			console.error("Error parsing move message:", err);
		}
	};
}
