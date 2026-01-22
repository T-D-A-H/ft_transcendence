
const LOGGER 	 = require("../LOGGER.js");

function verify2FAhandle(userManager, fastify, setTokenCookie) {

	return async function verify2FAHandler(req, reply) {
		const {  code } = req.body;

		if (!tempToken || !code) {
			LOGGER(400, "server", "verify2FAHandler", "Faltan datos");
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
				LOGGER(401, "server", "verify2FAHandler", "Token inválido");
				return reply.code(401).send({ 
					status: "error",
					error: "Token inválido" 
				});
			}

			const userId = decoded.id;

			// Verificar código 2FA
			if (!userManager.verify2FACode(userId, parseInt(code))) {
				LOGGER(401, "server", "verify2FAHandler", "Código 2FA incorrecto o expirado");
				return reply.code(401).send({ 
					status: "error",
					error: "Código 2FA incorrecto o expirado" 
				});
			}

			// Login exitoso
			if (userManager.loginUser(userId) ===  false) {
				LOGGER(401, "server", "verify2FAHandler", "Usuario ya logeado");
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

			LOGGER(200, "server", "verify2FAHandler", "Verified 2FA Succesfully");
			return reply.send({ 
				status: "ok"
			});

		} catch (err) {
			LOGGER(401, "server", "verify2FAHandler", "2FA verification error:" + err);
			return reply.code(401).send({ 
				status: "error",
				error: "Token inválido o expirado" 
			});
		}
	};
}

module.exports = verify2FAhandle;