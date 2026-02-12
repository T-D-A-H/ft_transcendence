
const LOGGER 	 = require("../../LOGGER.js");

function buildLogoutHandler(userManager, fastify) {

	return async function handleLogout(req, reply) {
		const isSoftLogout = req.query.soft === 'true';
		try {
            if (!isSoftLogout) {
                const token = req.cookies?.accessToken;
                if (token) {
                    try {
                        const decoded = fastify.jwt.verify(token);
                        const userId = decoded.id;
                        const player = userManager.getUserByID(userId);
                        
                        if (player) {
                            player.isConnected = false;
                            player.socket = null;
                        }
                    } catch (e) {
                    }
                }
            }

            reply.clearCookie('accessToken', { path: '/' });
            reply.clearCookie('temp2FA', { path: '/' });

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
	}
}

module.exports = buildLogoutHandler;