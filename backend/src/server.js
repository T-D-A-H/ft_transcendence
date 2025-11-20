const Fastify = require("fastify");
const websocket = require("@fastify/websocket");
const fastifyStatic = require("@fastify/static");
const path = require("path");

const fastify = Fastify({ logger: true });

async function startServer() {
  // Registrar WebSocket
  await fastify.register(websocket);

  // Servir archivos estáticos
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
    prefix: "/",
  });

  // Estado del juego
  const clients = [];
  let playerY1 = 150;
  let playerY2 = 150;
  let move1 = 0; // -1=arriba, 1=abajo
  let move2 = 0;

  // WebSocket para juego
  fastify.get("/ws", { websocket: true }, (conn) => {
    clients.push(conn);

    conn.socket.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw);
        console.log("Mensaje recibido:", msg);

        // Actualizar direcciones de movimiento
        if (msg.type === "MOVE_UP_1") move1 = -1;
        if (msg.type === "MOVE_DOWN_1") move1 = 1;
        if (msg.type === "STOP_1") move1 = 0;

        if (msg.type === "MOVE_UP_2") move2 = -1;
        if (msg.type === "MOVE_DOWN_2") move2 = 1;
        if (msg.type === "STOP_2") move2 = 0;
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    conn.socket.on("close", () => {
      const index = clients.indexOf(conn);
      if (index !== -1) clients.splice(index, 1);
    });
  });

  // Actualizar estado del juego
  setInterval(() => {
    playerY1 += move1 * 5;
    playerY2 += move2 * 5;

    // Limitar paletas al canvas
    playerY1 = Math.max(0, Math.min(340, playerY1));
    playerY2 = Math.max(0, Math.min(340, playerY2));

    const state = JSON.stringify({ type: "STATE", playerY1, playerY2 });
    clients.forEach(c => {
      if (c.socket.readyState === 1) { // WebSocket.OPEN
        c.socket.send(state);
      }
    });
  }, 16);

  // Ruta de health check
  fastify.get("/api/health", async (request, reply) => {
    return { status: "OK", clients: clients.length };
  });

  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("🚀 Servidor corriendo en http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer();