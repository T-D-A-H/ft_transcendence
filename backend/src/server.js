const Fastify = require("fastify");
const websocket = require("@fastify/websocket");

const fastify = Fastify({ logger: true });

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Asegurar que el directorio data existe
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath);


async function startServer() {

  const clients = [];
  let playerY1 = 150;
  let playerY2 = 150;
  let move1 = 0;
  let move2 = 0;

  await fastify.register(websocket);

  //* --- LOGIN DEL JUEGO---

  fastify.post("/login", async (req, reply) => {
    const { username, password } = req.body || {};

    if (!username || !password) {
      reply.code(400).send({ error: "Faltan campos obligatorios" });
      return;
    }

    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (err) {
          reply.code(500).send({ error: "Error de base de datos" });
          resolve();
          return;
        }
        if (!row) {
          reply.code(401).send({ error: "Credenciales incorrectas" });
          resolve();
          return;
        }
        resolve({ status: "success", message: "Login correcto", user: row.username });
      });
    });
  });

  //* --- REGISTRO DEL JUEGO---
  fastify.post("/register", async (req, reply) => {
    const { username, display_name, email, password } = req.body || {};

    if (!username || !display_name || !email || !password) {
      reply.code(400).send({ error: "Faltan campos obligatorios" });
      return;
    }
    console.log(`Intento de registro: ${username}`);

    return new Promise((resolve, reject) => {
      db.get("SELECT id FROM users WHERE username = ? OR email = ?",
        [username, email], (err, row) => {
          if (err) {
            console.error("Error de base de datos:", err);
            reply.code(500).send({ error: "Error de base de datos" });
            resolve();
            return;
          }

          if (row) {
            // Usuario o email ya registrado
            reply.code(409).send({ error: "Usuario o email ya registrado" });
            resolve();
            return;
          }

          // Insertar nuevo usuario
          db.run(
            "INSERT INTO users (username, display_name, email, password) VALUES (?, ?, ?, ?)",
            [username, display_name, email, password],
            function (err) {
              if (err) {
                console.error("Error al insertar usuario:", err.message);
                if (err.message.includes("UNIQUE constraint failed")) {
                  reply.code(409).send({ error: "Usuario o email ya registrado" });
                } else {
                  reply.code(500).send({ error: "Error al crear usuario" });
                }
                resolve();
                return;
              }
              reply.code(201).send({ status: "success", message: "Usuario registrado", userId: this.lastID });
              resolve({ status: "success", message: "Login correcto", user: row.username });
            }
          );
        });
    });
  });

  //* --- LÓGICA DEL JUEGO (WebSocket) ---
  fastify.get("/pong", { websocket: true }, (conn) => {
    console.log("Nuevo jugador conectado!");
    clients.push(conn);

    conn.socket.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw);

        // Lógica de movimient
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

  setInterval(() => {
    playerY1 += move1 * 5;
    playerY2 += move2 * 5;

    playerY1 = Math.max(0, Math.min(340, playerY1));
    playerY2 = Math.max(0, Math.min(340, playerY2));

    const state = JSON.stringify({ type: "STATE", playerY1, playerY2 });

    clients.forEach(c => {
      if (c.socket.readyState === 1) {
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