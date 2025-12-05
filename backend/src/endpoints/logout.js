
const LOGGER 	 = require("../LOGGER.js");

function buildLogoutHandler(userManager, fastify) {
	return async function handleLogout(req, reply) {
		const { token } = req.body || {};

		if (!token) {
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
			const player = userManager.getUser(userId);
			if (player) {
				player.isConnected = false;  // Marcar desconectado
				player.socket = null;        // Limpiar socket si existe
			}

			return reply.send({ status: "ok" });

		} catch (err) {
			console.error("Logout error:", err);

			if (err.name === 'JsonWebTokenError') {
				return reply.code(401).send({ status: "error", error: "Token inválido" });
			}
			if (err.name === 'TokenExpiredError') {
				return reply.code(401).send({ status: "error", error: "Token expirado" });
			}

			return reply.code(500).send({ status: "error", error: "Error en el servidor" });
		}
	};
}

module.exports = buildLogoutHandler;
