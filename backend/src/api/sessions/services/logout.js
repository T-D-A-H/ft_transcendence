
const LOGGER 	 = require("../../../LOGGER.js");

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
                        await notifyFriendsOffline(userId, userManager);
                        
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
				return reply.code(401).send({ status: "error", error: "Invalid Token" });
			}
			if (err.name === 'TokenExpiredError') {
				LOGGER(401, "server", "handleLogout", "Token expirado");
				return reply.code(401).send({ status: "error", error: "Expired token" });
			}
			LOGGER(500, "server", "handleLogout", "Logout error: " + err);
			return reply.code(500).send({ status: "error", error: "Server error" });
		}
	}
}

async function notifyFriendsOffline(userId, userManager) {
    const db = userManager.db;
    if (!db) return;

    try {
        const rows = await new Promise((resolve, reject) => {
            db.all(
                `SELECT 
                    CASE WHEN user_id = ? THEN target_id ELSE user_id END as friend_id
                FROM relationships
                WHERE (user_id = ? OR target_id = ?)
                  AND type = 'friend'
                  AND status = 'ACCEPTED'`,
                [userId, userId, userId],
                (err, rows) => err ? reject(err) : resolve(rows || [])
            );
        });

        for (const row of rows) {
            const friend = userManager.getUserByID(row.friend_id);
            if (friend && friend.getIsConnected()) {
                friend.notify("FRIEND_UPDATE", "Friend went offline", null);
            }
        }
    } catch (err) {
        console.error("Error notifying friends on logout:", err);
    }
}

module.exports = buildLogoutHandler;