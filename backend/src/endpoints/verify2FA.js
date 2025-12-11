function verify2FACode(userManager, fastify, setTokenCookie) {
	return async function verify2FAHandler(req, reply) {
		const {  code } = req.body;

		if ( !code) {
			return reply.code(400).send({ 
				status: "error",
				error: "Faltan datos" 
			});
		}

		try {
			// Obtener el token temporal de la cookie (httpOnly)
			const tempToken = req.cookies?.temp2FA;

			if (!tempToken) {
				return reply.code(401).send({ 
					status: "error",
					error: "Session expirada - intenta login de nuevo" 
				});
			}

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

			// Setear cookie de acceso
			setTokenCookie(reply, token);

			// Limpiar cookie temporal
			reply.clearCookie('temp2FA');

			return reply.send({ 
				status: "ok"
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