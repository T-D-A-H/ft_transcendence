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
			// ! ---- Validate Username ----
/* 			const cleanUsername = username.trim();
            
            // Solo letras (a-z, A-Z), números (0-9) y guión bajo (_)
            const usernameRegex = /^[a-zA-Z0-9_]+$/;

            if (!usernameRegex.test(cleanUsername)) {
                return reply.code(400).send({ 
                    error: "Invalid username. Only letters, numbers, and underscores are allowed (no spaces or emojis)" 
                });
            }

            if (cleanUsername.length < 3 || cleanUsername.length > 20) {
                return reply.code(400).send({ error: "El usuario debe tener entre 3 y 20 caracteres." });
            } */

			// ! ---- Validate Password ----
/* 			const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
			
			if (!PASSWORD_REGEX.test(password)) {
				return reply.code(400).send({
					status: "error",
					error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo"
				});
			} */

			// ! ---- Validate Email ----
/* 			const cleanEmail = email.trim().toLowerCase();
			// Esta regex verifica: texto + @ + texto + . + extensión de 2 a 6 letras
			const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
			
			if (!emailRegex.test(cleanEmail)) {
				return reply.code(400).send({ 
					status: "error",
					error: "Formato de correo electrónico inválido (ejemplo: usuario@dominio.com)" 
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
				{ expiresIn: "7d" }
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