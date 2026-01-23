
const LOGGER 	 = require("../LOGGER.js");

function buildLogoutHandler(userManager, fastify) {

	return async function handleLogout(req, reply) {
		const token = req.cookies?.accessToken;
		
		try {
			// Obtener token de la cookie
			const token = req.cookies?.accessToken;

			if (!token) {
				LOGGER(400, "server", "handleLogout", "Falta el token");
				return reply.code(400).send({
					status: "error",
					error: "Falta el token"
				});
			}

			try {
				// Decodificar el token
				const decoded = fastify.jwt.verify(token);
				const userId = decoded.id;

				// Obtener usuario
				const player = userManager.getUserByID(userId);
				if (player) {
					player.isConnected = false;  // Marcar desconectado
					player.socket = null;        // Limpiar socket si existe
				}

				// Limpiar la cookie
				reply.clearCookie('accessToken');
				reply.clearCookie('temp2FA');

			} catch (err) {
				if (err.name === 'JsonWebTokenError') {
					LOGGER(401, "server", "handleLogout", "Token inválido");
					return reply.code(401).send({ status: "error", error: "Token inválido" });
				}
				if (err.name === 'TokenExpiredError') {
					LOGGER(401, "server", "handleLogout", "Token expirado");
					return reply.code(401).send({ status: "error", error: "Token expirado" });
				}
				LOGGER(500, "server", "handleLogout", "Logout error: " + err);
				return reply.code(500).send({ status: "error", error: "Error en el servidor" });
			}
		} catch (err) {
			console.error("Logout error:", err);
			return reply.code(500).send({ 
				status: "error", 
				error: "Error en el servidor" 
			});
		}
	}
}

module.exports = buildLogoutHandler;