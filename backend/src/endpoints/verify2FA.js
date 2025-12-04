function verify2FACode(userManager, fastify) {
	return async function verify2FAHandler(req, reply) {
		const { tempToken, code } = req.body;

		if (!tempToken || !code) {
			return reply.code(400).send({ 
			status: "error",
			error: "Faltan datos" 
			});
		}

		try {
			// Verificar token temporal
			const decoded = fastify.jwt.verify(tempToken);
			
			if (decoded.step !== "2fa_pending") {
				return reply.code(401).send({ 
					status: "error",
					error: "Token inválido" 
				});
			}

			const userId = decoded.id;

			// Verificar código 2FA
			if (!userManager.verify2FACode(userId, parseInt(code))) {
				return reply.code(401).send({ 
					status: "error",
					error: "Código 2FA incorrecto o expirado" 
				});
			}

			// Login exitoso
			if (userManager.loginUser(userId) ===  false) {
				return reply.code(401).send({ 
					status: "error",
					error: "Usuario ya logeado" 
				});
			}

			// Generar token final
			const token = fastify.jwt.sign({ 
				id: userId, 
				display_name: decoded.display_name 
			});

			return reply.send({ 
				status: "ok", 
				token,
				userId: userId 
			});

		} catch (err) {
			console.error("2FA verification error:", err);
			return reply.code(401).send({ 
				status: "error",
				error: "Token inválido o expirado" 
			});
		}
	};
}

module.exports = verify2FACode;