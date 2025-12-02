const nodemailer = require("nodemailer");
const User = require("../src/User.js");

function buildLoginHandler(db, bcrypt, userManager, fastify, option) {
	return async function handleLogin(req, reply) {
		const { display_name, password } = req.body || {};

		if (!display_name || !password)
			return reply.code(400).send({ error: "Missing fields" });

		try {
			const user = await new Promise((resolve, reject) => {
				db.get(
					"SELECT id, username, display_name, email, password FROM users WHERE display_name = ?",
					[display_name],
					(err, row) => err ? reject(err) : resolve(row)
				);
			});

			if (!user)
				return reply.code(401).send({ error: "Invalid credentials" });

			const match = await bcrypt.compare(password, user.password);
			if (!match)
				return reply.code(401).send({ error: "Invalid credentials" });
			
			if (option === "2FAmail") {
				// 2FA
				const temp2FAToken = fastify.jwt.sign(
					{ id: user.id, step: "2fa_pending" },
					{ expiresIn: "5m" }
				);
	
				// Generar código 2FA
				const code = Math.floor(100000 + Math.random() * 900000);
				userManager.set2FACode(user.id, code);

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
					subject: "Código 2FA",
					text: `Tu código de 2FA es: ${code}`
				});
	
				// Retornar token temporal
				return reply.send({ status: "2fa_required", tempToken: temp2FAToken });
			}
			if (option == "skip") {
				// Login SKIP sin nada
				const player = new User({
					id: user.id,
					username: user.username,
					display_name: user.display_name,
					socket: null
				});

				userManager.addUser(player);
				userManager.loginUser(player.id);

				// Emitir JWT final
				const token = fastify.jwt.sign({ id: player.id, display_name: player.display_name });
				return reply.send({ status: "ok", token });
			}

		}
		catch (err) {
			console.error("Login error:", err);
			return reply.code(500).send({ error: "Database error" });
		}
	};
}

module.exports = buildLoginHandler;