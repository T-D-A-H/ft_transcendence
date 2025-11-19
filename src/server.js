/* import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });

//* ---------------------------------------------------------
//* 1. SWAGGER (Documentación de la API)
//* ---------------------------------------------------------
await fastify.register(swagger, {
  openapi: {
    info: {
      title: "API ft_transcendencer",
      version: "1.0.0",
    },
  },
});

await fastify.register(swaggerUI, {
  routePrefix: "/docs",
  staticCSP: true,
});

//* --------------------------------------------------------- 
//* 2. SERVIR EL FRONTEND (HTML, JS, CSS)
//* ---------------------------------------------------------
await fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"), // carpeta donde está tu frontend
  prefix: "/", // acceso directo desde "/"
  index: "index.html", // sirve index.html por defecto
});

//* ---------------------------------------------------------
//* 3. ENDPOINTS DE LA API (GET, POST, etc.)
//* ---------------------------------------------------------

// Ejemplo de endpoint simple
fastify.get("/ping", async () => {
  return { pong: true };
});

// Si quisieras definir "/" manualmente, sería aquí,
// aunque NO es necesario porque fastify-static ya lo sirve.
/* fastify.get("/", async (_, reply) => {
  return reply.sendFile("index.html");
}); */

/* //* ---------------------------------------------------------
//* 4. INICIO DEL SERVIDOR
//* --------------------------------------------------------- 
fastify
  .listen({ port: 3000, host: "0.0.0.0" })
  .then(() => {
    console.log("Server running: http://localhost:3000");
    console.log("Swagger docs: http://localhost:3000/docs");
  }); */

import Fastify from "fastify";
import websocket from "@fastify/websocket";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });
await fastify.register(websocket);

// Servir archivos estáticos
await fastify.register(fastifyStatic, {
  root: path.join(__dirname, "public"),
  prefix: "/",
  index: "index.html",
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
    const msg = JSON.parse(raw);

    // Actualizar direcciones de movimiento
    if (msg.type === "MOVE_UP_1") move1 = -1;
    if (msg.type === "MOVE_DOWN_1") move1 = 1;
    if (msg.type === "STOP_1") move1 = 0;

    if (msg.type === "MOVE_UP_2") move2 = -1;
    if (msg.type === "MOVE_DOWN_2") move2 = 1;
    if (msg.type === "STOP_2") move2 = 0;
  });

  conn.socket.on("close", () => {
    const index = clients.indexOf(conn);
    if (index !== -1) clients.splice(index, 1);
  });
});

setInterval(() => {
  playerY1 += move1 * 5;
  playerY2 += move2 * 5;

  // Limitar paletas al canvas
  playerY1 = Math.max(0, Math.min(340, playerY1));
  playerY2 = Math.max(0, Math.min(340, playerY2));

  const state = JSON.stringify({ type: "STATE", playerY1, playerY2 });
  clients.forEach(c => c.socket.send(state));
}, 16);

fastify.listen({ port: 3000 , host: "0.0.0.0"}).then(() =>
  console.log("Servidor en http://localhost:3000")
);
