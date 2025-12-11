function buildLogoutHandler(userManager, fastify) {
	return async function handleLogout(req, reply) {
		try {
			// Obtener token de la cookie
			const token = req.cookies?.accessToken;

			if (!token) {
				return reply.code(400).send({
					status: "error",
					error: "No hay sesión activa"
				});
			}

			try {
				// Decodificar el token
				const decoded = fastify.jwt.verify(token);
				const userId = decoded.id;

				// Obtener usuario
				const player = userManager.getUser(userId);
				if (player) {
					player.isConnected = false;  // Marcar desconectado
					player.socket = null;        // Limpiar socket si existe
				}

				// Limpiar la cookie
				reply.clearCookie('accessToken');
				reply.clearCookie('temp2FA');

				return reply.send({ status: "ok" });

			} catch (err) {
				if (err.name === 'JsonWebTokenError') {
					return reply.code(401).send({ 
						status: "error", 
						error: "Token inválido" 
					});
				}
				if (err.name === 'TokenExpiredError') {
					return reply.code(401).send({ 
						status: "error", 
						error: "Token expirado" 
					});
				}
				throw err;
			}

		} catch (err) {
			console.error("Logout error:", err);
			return reply.code(500).send({ 
				status: "error", 
				error: "Error en el servidor" 
			});
		}
	};
}

module.exports = buildLogoutHandler;