
const LOGGER 	 = require("../../../LOGGER.js");

function buildSet2FAHandler(db, fastify) {

	return async function handleSet2FA(req, reply) {
		const { method } = req.body || {};

		if (!method) {
			LOGGER(400, "server", "handleSet2FA", "Falta el método 2FA");
			return reply.code(400).send({ 
				status: "error",
				msg: "Missing 2FA method" 
			});
		}

		const validMethods = ['skip', '2FAmail'];
		if (!validMethods.includes(method)) {

			LOGGER(400, "server", "handleSet2FA", "Método 2FA inválido");
			return reply.code(400).send({ 
				status: "error",
				msg: "Invalid 2FA method" 
			});
		}

		try {
			const authHeader = req.headers.authorization;
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				LOGGER(401, "server", "handleSet2FA", "No autorizado - Token requerido");
				return reply.code(401).send({ 
					status: "error",
					msg: "Not authorized - Token required" 
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

			LOGGER(200, "server", "handleSet2FA", "token authorized");
			return reply.send({ 
				status: "ok" 
			});

		} catch (err) {


			if (err.name === 'JsonWebTokenError') {
				LOGGER(401, "server", "handleSet2FA", "Token inválido");
				return reply.code(401).send({ 
					status: "error",
					msg: "Invalid Token" 
				});
			}
			if (err.name === 'TokenExpiredError') {
				LOGGER(401, "server", "handleSet2FA", "Token expirado");
				return reply.code(401).send({ 
					status: "error",
					msg: "Expired Token" 
				});
			}
			LOGGER(500, "server", "handleSet2FA", "Error en el servidor");
			return reply.code(500).send({ 
				status: "error",
				msg: "Server Error" 
			});
		}
	};
}

module.exports = buildSet2FAHandler;
