const Fastify = require("fastify");
const websocket = require("@fastify/websocket");
const bcrypt = require('bcryptjs');
const db = require("./init_db"); // Importamos la DB
const saltRounds = 12;

const fastify = Fastify({ logger: true });

async function startServer() {
	const clients = [];
	let playerY1 = 150;
	let playerY2 = 150;
	let move1 = 0;
	let move2 = 0;

	await fastify.register(websocket);

	// ── AUTH ──
	fastify.post("/login", async (req, reply) => {
		const { display_name, password } = req.body || {};
		if (!display_name || !password) {
			return reply.code(400).send({ error: "faltan campos" });
		}
		return new Promise((res) => {
			db.get(
				"SELECT display_name, password FROM users WHERE display_name = ?",
				[display_name],
				async (err, row) => {
					if (err) return reply.code(500).send({ error: "db error" });
					if (!row) return reply.code(401).send({ error: "credenciales mal" });

					const match = await bcrypt.compare(password, row.password);
					if (!match) return reply.code(401).send({ error: "credenciales mal" });

					reply.send({ ok: true, user: row.display_name });
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

		try {
			const hashedPassword = await bcrypt.hash(password, saltRounds);
			return new Promise((res) => {
				db.run(
					"INSERT INTO users (username, display_name, email, password) VALUES (?,?,?,?)",
					[username, display_name, email, hashedPassword],
					(err) => {
						if (err)
							return reply.code(409).send({ error: "usuario o email ya existe" });
						reply.code(201).send({ ok: true });
						res();
					}
				);
			});

		} catch {
			reply.code(500).send({ error: "error al registrar" });
		}
	});

	// ── GAME (WebSocket PONG) ──
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

	// Broadcast loop
	setInterval(() => {
		playerY1 = Math.max(0, Math.min(340, playerY1 + move1 * 5));
		playerY2 = Math.max(0, Math.min(340, playerY2 + move2 * 5));

		const state = JSON.stringify({ type: "STATE", playerY1, playerY2 });
		clients.forEach(c => {
			if (c.socket.readyState === 1) c.socket.send(state);
		});
	}, 16);

	// ── ARRANCAR SERVER ──
	try {
		await fastify.listen({ port: 3000, host: "0.0.0.0" });
		console.log("Backend ON en 3000");
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}

startServer();
