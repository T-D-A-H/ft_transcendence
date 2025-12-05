
const LOGGER 	 = require("../LOGGER.js");

function buildSet2FAHandler(db, fastify) {
	return async function handleSet2FA(req, reply) {
		const { method } = req.body || {};

		if (!method) {
			return reply.code(400).send({ 
				status: "error",
				error: "Falta el método 2FA" 
			});
		}

		const validMethods = ['skip', '2FAmail'];
		if (!validMethods.includes(method)) {
			return reply.code(400).send({ 
				status: "error",
				error: "Método 2FA inválido" 
			});
		}

		try {
			const authHeader = req.headers.authorization;
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				return reply.code(401).send({ 
					status: "error",
					error: "No autorizado - Token requerido" 
				});
			}

			const token = authHeader.replace('Bearer ', '');
			const decoded = fastify.jwt.verify(token);
			const userId = decoded.id;

			await new Promise((resolve, reject) => {
				db.run(
					`UPDATE users SET twofa = ? WHERE id = ?`,
					[method, userId],
					(err) => err ? reject(err) : resolve()
				);
			});

			return reply.send({ 
				status: "ok" 
			});

		} catch (err) {
			console.error("Set 2FA error:", err);

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

			return reply.code(500).send({ 
				status: "error",
				error: "Error en el servidor" 
			});
		}
	};
}

module.exports = buildSet2FAHandler;
