const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Conectar con servidor
const socket = new WebSocket("ws://10.12.11.2:3000/ws");

let paddleY1 = 150;
let paddleY2 = 150;

// Recibir estado del servidor
socket.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  if (data.type === "STATE") {
    paddleY1 = data.playerY1;
    paddleY2 = data.playerY2;
  }
};

document.addEventListener("keydown", (e) => {
  if (e.key === "w") socket.send(JSON.stringify({ type: "MOVE_UP_1" }));
  if (e.key === "s") socket.send(JSON.stringify({ type: "MOVE_DOWN_1" }));
  if (e.key === "ArrowUp") socket.send(JSON.stringify({ type: "MOVE_UP_2" }));
  if (e.key === "ArrowDown") socket.send(JSON.stringify({ type: "MOVE_DOWN_2" }));
});

document.addEventListener("keyup", (e) => {
  if (e.key === "w" || e.key === "s") socket.send(JSON.stringify({ type: "STOP_1" }));
  if (e.key === "ArrowUp" || e.key === "ArrowDown") socket.send(JSON.stringify({ type: "STOP_2" }));
});


// Bucle de dibujo
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Paleta jugador 1
  ctx.fillStyle = "white";
  ctx.fillRect(20, paddleY1, 10, 60);

  // Paleta jugador 2
  ctx.fillStyle = "white";
  ctx.fillRect(570, paddleY2, 10, 60);

  requestAnimationFrame(draw);
}

draw();
