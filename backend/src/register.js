const User = require("../src/User.js");

function buildRegisterHandler(db, bcrypt, saltRounds, fastify) {
	return async function registerHandler(req, reply) {
		const body = req.body || {};
		const username = body.username;
		const display_name = body.display_name;
		const email = body.email;
		const password = body.password;

		if (!username || !display_name || !email || !password) {
			return reply.code(400).send({ error: "Missing fields" });
		}

		try {
			// Hash de la contraseña
			const hashed = await bcrypt.hash(password, saltRounds);

			// Insertar usuario con twofa por defecto en 'skip'
			const userId = await new Promise((resolve, reject) => {
				db.run(
					"INSERT INTO users (username, display_name, email, password, twofa) VALUES (?,?,?,?,?)",
					[username, display_name, email, hashed, "skip"],
					function(err) {
					if (err) reject(err);
					else resolve(this.lastID);
					}
				);
			});

			//  Generar token JWT temporal para configurar 2FA
			const setupToken = fastify.jwt.sign(
				{ 
					id: userId, 
					username: username,
					display_name: display_name,
					purpose: 'setup_2fa' // Identificador de propósito
				},
			);

			return reply.code(201).send({ 
				status: "ok",
				userId: userId,
				setupToken: setupToken 
			});
		}
		catch (err) {
			console.error("Error registering user:", err);
			
			if (err.message && err.message.includes("UNIQUE constraint failed")) {
				return reply.code(409).send({ 
					error: "Una cuenta con ese username, email o display_name ya existe" 
				});
			}
			
			return reply.code(500).send({ error: "Error interno del servidor" });
		}
	};
}

module.exports = { buildRegisterHandler };