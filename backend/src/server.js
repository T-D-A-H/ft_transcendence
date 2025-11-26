const Fastify = require("fastify");
const websocket = require("@fastify/websocket");

const fastify = Fastify({ logger: true });

const sqlite = require("sqlite3").verbose();
const fs = require("fs");
const db = new sqlite.Database("/data/database.sqlite");

// Ejecutar el SQL inicial si existe
const seedFile = "/data/database.sqlite";
if (fs.existsSync(seedFile)) {
  const sql = fs.readFileSync(seedFile, "utf8");
  db.exec(sql, (err) => {
    if (err) {
      console.error("Seed SQL falló:", err);
    } else {
      console.log("Seed SQL cargado OK");
    }
  });
}

async function startServer() {
  const clients = [];
  let playerY1 = 150;
  let playerY2 = 150;
  let move1 = 0;
  let move2 = 0;

  await fastify.register(websocket);

  // ── AUTH ───────────────────────────────
  fastify.post("/login", async (req, reply) => {
    const { display_name, password } = req.body || {};
    if (!display_name || !password) {
      return reply.code(400).send({ error: "faltan campos" });
    }
    return new Promise((res) => {
      db.get(
        "SELECT display_name FROM users WHERE display_name = ? AND password = ?",
        [display_name, password],
        (err, row) => {
          if (err)
            return reply.code(500).send({ error: "db error" });
          if (!row)
              return reply.code(401).send({ error: "credenciales mal" });
          reply.send({ ok: true, user: row.username });
          res();
        }
      );
    });
  });

  fastify.post("/register", async (req, reply) => {
    const { username, display_name, email, password } = req.body || {};
    if (!username || !display_name || !email || !password) {
      return reply.code(400).send({ error: "faltan campos" });
    }
    return new Promise((res) => {
      db.run(
        "INSERT INTO users (username, display_name, email, password) VALUES (?,?,?,?)",
        [username, display_name, email, password],
        (err) => {
          if (err)
            return reply.code(409).send({ error: "usuario o email ya existe" });
          reply.code(201).send({ ok: true });
          res();
        }
      );
    });
  });

  // ── GAME (WebSocket PONG) ───────────────
  fastify.get("/pong", { websocket: true }, (conn) => {
    console.log("Jugador conectado!");
    clients.push(conn);

    conn.socket.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.type === "MOVE_UP_1") move1 = -1;
        if (msg.type === "MOVE_DOWN_1") move1 = 1;
        if (msg.type === "STOP_1") move1 = 0;

        if (msg.type === "MOVE_UP_2") move2 = -1;
        if (msg.type === "MOVE_DOWN_2") move2 = 1;
        if (msg.type === "STOP_2") move2 = 0;
      } catch {}
    });

    conn.socket.on("close", () => {
      const i = clients.indexOf(conn);
      if (i !== -1) clients.splice(i, 1);
    });
  });

  // Broadcast loop del estado del juego
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

  // ── ARRANCAR SERVER ─────────────────────
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Backend ON en 3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

startServer();