import { BoardTheme, getTheme } from "./themes.js";

interface MoveMessage {
  type: "MOVE";
  playerY1: number;
  playerY2: number;
  ballX: number;
  ballY: number;
}
type ServerMessage = MoveMessage;

let currentTheme: BoardTheme = getTheme("classic");

function drawBackground(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  theme: BoardTheme
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (theme.centerLine) {
    ctx.strokeStyle = theme.centerLine;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawPaddle(
  ctx: CanvasRenderingContext2D,
  y: number,
  x: number,
  theme: BoardTheme
) {
  ctx.fillStyle = theme.paddle;
  ctx.fillRect(x, y, 10, 60);

  // Efecto glow
  if (theme.glow) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = theme.paddle;
    ctx.fillRect(x, y, 10, 60);
    ctx.shadowBlur = 0;
  }
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  x: number | undefined,
  y: number | undefined,
  theme: BoardTheme
) {
  if (typeof x !== "number" || typeof y !== "number") return;

  ctx.fillStyle = theme.ball;
  ctx.fillRect(x, y, 10, 10);

  // Efecto glow
  if (theme.glow) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = theme.ball;
    ctx.fillRect(x, y, 10, 10);
    ctx.shadowBlur = 0;
  }
}

export function setTheme(themeName: string): void {
  currentTheme = getTheme(themeName);
}

export function drawPreview(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): void {
  drawBackground(canvas, ctx, currentTheme);
  drawPaddle(ctx, 170, 10, currentTheme);
  drawPaddle(ctx, 170, canvas.width - 20, currentTheme);
  drawBall(ctx, 295, 195, currentTheme);
}

export function drawMiniPreview(
  canvas: HTMLCanvasElement,
  themeName: string
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const theme = getTheme(themeName);
  const scale = canvas.width / 600;

  // Draw background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (theme.centerLine) {
    ctx.strokeStyle = theme.centerLine;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.fillStyle = theme.paddle;
  const paddleWidth = 2;
  const paddleHeight = 12;
  const paddleY = canvas.height / 2 - paddleHeight / 2;

  if (theme.glow) {
    ctx.shadowBlur = 3;
    ctx.shadowColor = theme.paddle;
  }

  ctx.fillRect(2, paddleY, paddleWidth, paddleHeight);
  ctx.fillRect(canvas.width - 4, paddleY, paddleWidth, paddleHeight);

  ctx.fillStyle = theme.ball;
  const ballSize = 2;
  ctx.fillRect(
    canvas.width / 2 - ballSize / 2,
    canvas.height / 2 - ballSize / 2,
    ballSize,
    ballSize
  );

  if (theme.glow) {
    ctx.shadowBlur = 0;
  }
}

export function drawGame(
  userSocket: WebSocket,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): void {
  userSocket.onmessage = (event: MessageEvent) => {
    try {
      const data: ServerMessage = JSON.parse(event.data);

      if (data.type === "MOVE") {
        drawBackground(canvas, ctx, currentTheme);
        drawPaddle(ctx, data.playerY1, 10, currentTheme);
        drawPaddle(ctx, data.playerY2, canvas.width - 20, currentTheme);
        drawBall(ctx, data.ballX, data.ballY, currentTheme);
      }
    } catch (err) {
      console.error("Error parsing move message:", err);
    }
  };
}
