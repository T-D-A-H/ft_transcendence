const Fastify   = require("fastify");
const websocket = require("@fastify/websocket");

const fastify = Fastify({ logger: true });

// Simulación de Base de Datos (Para que pruebes el login)
const USERS_DB = [
  { username: "admin", password: "1234" },
  { username: "jaime", password: "hola" }
];

async function startServer() {

  // 1. Registrar Plugin de WebSocket
  await fastify.register(websocket);

  //* --- RUTAS API (JSON) ---

  // Ruta de Login
  fastify.post("/login", async (req, reply) => {
    // Fastify parsea el JSON automáticamente si el frontend envía
    // Content-Type: application/json
    const { username, password } = req.body || {};

    console.log(`Intento de login: ${username}`);

    // Buscamos en el array (Simulando DB)
    const user = USERS_DB.find(u => u.username === username && u.password === password);

    if (!user) {
      // Devolvemos 401 Unauthorized
      return reply.code(401).send({ error: "Credenciales incorrectas" });
    }

    // Login OK
    return { status: "success", message: "Login correcto", user: username };
  });



  //* --- LÓGICA DEL JUEGO (WebSocket) ---

  const clients = [];
  let playerY1 = 150;
  let playerY2 = 150;
  let move1 = 0; 
  let move2 = 0;

  // IMPORTANTE: Esta ruta debe coincidir con el 'proxy_pass' o la location de Nginx
  // En el Nginx pusimos: location /socket-pong { ... }
  fastify.get("/proxy-pong", { websocket: true }, (conn) => {
    console.log("Nuevo jugador conectado!");
    clients.push(conn);

    conn.socket.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw);
        
        // Lógica de movimiento
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
      console.log("Jugador desconectado");
      const index = clients.indexOf(conn);
      if (index !== -1) clients.splice(index, 1);
    });
  });

  // Bucle del juego (Game Loop) - 60 FPS aprox
  setInterval(() => {
    playerY1 += move1 * 5;
    playerY2 += move2 * 5;

    // Límites del canvas (0 a 340 aprox considerando altura de paleta)
    playerY1 = Math.max(0, Math.min(340, playerY1));
    playerY2 = Math.max(0, Math.min(340, playerY2));

    const state = JSON.stringify({ type: "STATE", playerY1, playerY2 });
    
    // Enviar estado a todos los clientes conectados
    clients.forEach(c => {
      if (c.socket.readyState === 1) { // 1 = OPEN
        c.socket.send(state);
      }
    });
  }, 16);

  // Arrancar servidor
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Backend corriendo en puerto 3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer();