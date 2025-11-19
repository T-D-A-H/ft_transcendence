const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Conectar con el servidor
const socket = new WebSocket("ws://localhost:3000/ws");

let paddleY = 150;

// Cuando llega un estado del servidor
socket.onmessage = (msg) => {
  const data = JSON.parse(msg.data);

  if (data.type === "STATE") {
    paddleY = data.playerY;
  }
};

// Detectar teclas
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    socket.send(JSON.stringify({ type: "MOVE_UP" }));
  }
  if (e.key === "ArrowDown") {
    socket.send(JSON.stringify({ type: "MOVE_DOWN" }));
  }
});

// Bucle de dibujo
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar paleta
  ctx.fillStyle = "white";
  ctx.fillRect(20, paddleY, 10, 60);

  requestAnimationFrame(draw);
}

draw();
