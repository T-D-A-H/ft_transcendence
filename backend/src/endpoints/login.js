const nodemailer = require("nodemailer");
const User 		 = require("../Classes/User.js");
const LOGGER 	 = require("../LOGGER.js");


function loginHandler(db, bcrypt, userManager, fastify, setTokenCookie) {
	return async function handleLogin(req, reply) {
	const { username, password } = req.body || {};

	if (!username || !password) {
		LOGGER(400, "server", "handleLogin", "Missing fields");
		return reply.code(400).send({ error: "Missing fields" });
	}

	try {
		const cleanUsername = username.trim();
		// 1. Buscar usuario en la BD
		const user = await new Promise((resolve, reject) => {
			db.get(
				"SELECT id, username, display_name, email, password, twofa FROM users WHERE username = ?",
				[cleanUsername],
				(err, row) => err ? reject(err) : resolve(row)
			);
		});

		// 2. Validar que el usuario existe
		if (!user) {
			LOGGER(401, "server", "handleLogin", "Credenciales incorrectas");
			return reply.code(401).send({ 
				status: "error",
				error: "Credenciales incorrectas" 
			});
		}
		
		// 3. Validar contraseña
		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			LOGGER(401, "server", "handleLogin", "Credenciales incorrectas");
			return reply.code(401).send({ 
				status: "error",
				error: "Credenciales incorrectas" 
			});
		}

		// 4. Credenciales válidas - verificar si tiene 2FA activado
		if (user.twofa === "2FAmail") {
			// Generar token temporal
			const temp2FAToken = fastify.jwt.sign(
				{ 
					id: user.id, 
					username: user.username,
					display_name: user.display_name,
					step: "2fa_pending" 
				},
				{ expiresIn: "10m" }
			);

			// Generar código 2FA (6 dígitos)
			const code = Math.floor(100000 + Math.random() * 900000);

			let player = userManager.getUserByID(user.id);
			if (!player) {
				player = new User({
					id: user.id,
					username: user.username,
					display_name: user.display_name,
					socket: null
				});
				userManager.addUser(player);
			}
			
			userManager.set2FACode(user.id, code);

			// Enviar email con código
			const transporter = nodemailer.createTransport({
				host: "smtp.gmail.com",
				port: 587,
				secure: false,
				auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS
				}
			});

			await transporter.sendMail({
				from: `"Mini Pong" <${process.env.SMTP_USER}>`,
				to: user.email,
				subject: "Código 2FA - Mini Pong",
				text: `Tu código de verificación es: ${code}\n\nEste código expira en 10 minutos.`
			});

			reply.setCookie('temp2FA', temp2FAToken, {
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 10 * 60 * 1000, // 10 minutos
				path: '/'
			});

			// Retornar que se requiere 2FA
			return reply.send({ 
				status: "requires_2fa",
				method: "email"
			});
		}

		const existingPlayer = userManager.getUserByID(user.id);
		if (existingPlayer) {
			userManager.forceDisconnect(user.id); 
		}

		const newPlayer = new User({
			id: user.id,
			username: user.username,
			display_name: user.display_name,
			socket: null
		});

		userManager.addUser(newPlayer);
		userManager.loginUser(user.id);

		const token = fastify.jwt.sign(
			{ 
			id: user.id, 
			display_name: user.display_name
			},
			{ expiresIn: "7d" }
		);

		// Setear cookie httpOnly
		setTokenCookie(reply, token);

		return reply.send({ 
			status: "ok"
		});

	} catch (err) {
		LOGGER(500, "server", "handleLogin", "Login Error: " + err);
		return reply.code(500).send({ 
			status: "error",
			error: "Error en el servidor" 
		});
	}
	};
}

module.exports = loginHandler;