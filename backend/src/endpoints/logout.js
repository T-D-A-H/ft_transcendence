
const LOGGER 	 = require("../LOGGER.js");

function buildLogoutHandler(userManager, fastify) {

	return async function handleLogout(req, reply) {
        const cookieOptions = {
            path: '/', 
            secure: true, 
            httpOnly: true, 
            sameSite: 'strict'
        };
        
        reply.clearCookie('accessToken', cookieOptions);
        reply.clearCookie('temp2FA', cookieOptions);
		
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
					userManager.logoutUser(userId);
					if (player.socket)
						player.socket.close();
					userManager.removeUser(userId);
					LOGGER(200, "server", "handleLogout", "Logged out succesfully");
				}
				else {
					LOGGER(501, "server", "handleLogout", "Couldnt find User to log out");
				}
				reply.clearCookie('accessToken');
				reply.clearCookie('temp2FA');
				return reply.send({ status: "ok" });
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