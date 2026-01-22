const User = require("../Classes/User.js");

function signupHandler(db, bcrypt, saltRounds, fastify) {
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
			// ! Descomentar cuando este completo
/* 			const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
			
			if (!PASSWORD_REGEX.test(password)) {
				return reply.code(400).send({
					status: "error",
					error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo"
				});
			} */

			// Hash de la contraseña
			const hashed = await bcrypt.hash(password, saltRounds);

			// Insertar usuario con twofa por defecto en 'skip'
			const userId = await new Promise((resolve, reject) => {
			db.run(
				"INSERT INTO users (username, display_name, email, password, twofa, oauth_provider, oauth_id) VALUES (?,?,?,?,?,?,?)",
				[username, display_name, email, hashed, "skip", null, null],
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
					error: "Ya existe una cuenta con estos datos" 
				});
			}
			
			return reply.code(500).send({ error: "Error interno del servidor" });
		}
	};
}

module.exports = signupHandler;