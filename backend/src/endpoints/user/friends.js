const LOGGER = require("../../LOGGER.js");

async function friendsHandler(fastify, options) {
    const { userManager, authFromCookie } = options;

    // GET /api/friends/ - lista de amigos aceptados con estado online
    fastify.get('/', { preHandler: authFromCookie }, async (req, reply) => {
        try {
            const userId = req.user.getId();
            const db = userManager.db;

            const query = `
                SELECT 
                    u.id, u.username, u.display_name, u.avatar,
                    r.status, r.type
                FROM relationships r
                JOIN users u ON (
                    CASE WHEN r.user_id = ? THEN r.target_id ELSE r.user_id END = u.id
                )
                WHERE (r.user_id = ? OR r.target_id = ?)
                  AND r.type = 'friend'
                  AND r.status = 'ACCEPTED'
            `;

            const rows = await new Promise((resolve, reject) => {
                db.all(query, [userId, userId, userId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });

            const friends = rows.map(row => ({
                id: row.id,
                username: row.username,
                display_name: row.display_name,
                avatar: row.avatar || "&#9865;",
                online: userManager.isUserConnected(row.id)
            }));

            LOGGER(200, "friends.js", "GET /", `${friends.length} friends for user ${userId}`);
            return reply.code(200).send({ status: 200, msg: "Friends fetched.", target: friends });

        } catch (err) {
            LOGGER(500, "friends.js", "GET /", err.message);
            return reply.code(500).send({ status: 500, msg: "Internal server error." });
        }
    });

    // GET /api/friends/requests - solicitudes pendientes entrantes
    fastify.get('/requests', { preHandler: authFromCookie }, async (req, reply) => {
        try {
            const userId = req.user.getId();
            const db = userManager.db;

            const query = `
                SELECT r.id as request_id, u.id, u.username, u.display_name, u.avatar
                FROM relationships r
                JOIN users u ON r.user_id = u.id
                WHERE r.target_id = ?
                  AND r.type = 'friend'
                  AND r.status = 'PENDING'
            `;

            const rows = await new Promise((resolve, reject) => {
                db.all(query, [userId], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });

            const requests = rows.map(row => ({
                request_id: row.request_id,
                id: row.id,
                username: row.username,
                display_name: row.display_name,
                avatar: row.avatar || "&#9865;",
                type: "friend"
            }));

            LOGGER(200, "friends.js", "GET /requests", `${requests.length} requests for ${userId}`);
            return reply.code(200).send({ status: 200, msg: "Requests fetched.", target: requests });

        } catch (err) {
            LOGGER(500, "friends.js", "GET /requests", err.message);
            return reply.code(500).send({ status: 500, msg: "Internal server error." });
        }
    });

    // POST /api/friends/add - enviar solicitud de amistad por username
    fastify.post('/add', { preHandler: authFromCookie }, async (req, reply) => {
        try {
            const userId = req.user.getId();
            const { username } = req.body || {};
            const db = userManager.db;

            if (!username || !username.trim()) {
                return reply.code(400).send({ status: 400, msg: "Username is required." });
            }

            const targetRow = await new Promise((resolve, reject) => {
                db.get("SELECT id, username, display_name FROM users WHERE username = ?",
                    [username.trim()], (err, row) => err ? reject(err) : resolve(row));
            });

            if (!targetRow) {
                return reply.code(404).send({ status: 404, msg: `User "${username}" not found.` });
            }
            if (targetRow.id === userId) {
                return reply.code(400).send({ status: 400, msg: "You cannot add yourself as a friend." });
            }

            const existing = await new Promise((resolve, reject) => {
                db.get(
                    `SELECT * FROM relationships WHERE 
                    (user_id = ? AND target_id = ?) OR (user_id = ? AND target_id = ?)`,
                    [userId, targetRow.id, targetRow.id, userId],
                    (err, row) => err ? reject(err) : resolve(row)
                );
            });

            if (existing) {
                if (existing.status === 'ACCEPTED')
                    return reply.code(400).send({ status: 400, msg: "You are already friends." });
                if (existing.status === 'PENDING')
                    return reply.code(400).send({ status: 400, msg: "Friend request already pending." });
            }

            await new Promise((resolve, reject) => {
                db.run(
                    "INSERT INTO relationships (user_id, target_id, type, status) VALUES (?, ?, 'friend', 'PENDING')",
                    [userId, targetRow.id],
                    (err) => err ? reject(err) : resolve()
                );
            });

            // Notificar al destinatario si está online
            const targetUser = userManager.getUserByID(targetRow.id);
            if (targetUser && targetUser.getIsConnected()) {
                targetUser.notify("NOTIFICATION", `${req.user.getUsername()} sent you a friend request.`, {
                    type: "friend_request"
                });
            }

            LOGGER(200, "friends.js", "POST /add", `Request from ${userId} to ${targetRow.id}`);
            return reply.code(200).send({ status: 200, msg: `Friend request sent to ${targetRow.display_name}.` });

        } catch (err) {
            LOGGER(500, "friends.js", "POST /add", err.message);
            return reply.code(500).send({ status: 500, msg: "Internal server error." });
        }
    });

    // POST /api/friends/respond/:request_id - aceptar o rechazar solicitud
    fastify.post('/respond/:request_id', { preHandler: authFromCookie }, async (req, reply) => {
        try {
            const userId = req.user.getId();
            const { request_id } = req.params;
            const { accept } = req.body || {};
            const db = userManager.db;

            const request = await new Promise((resolve, reject) => {
                db.get(
                    "SELECT * FROM relationships WHERE id = ? AND target_id = ? AND type = 'friend' AND status = 'PENDING'",
                    [request_id, userId],
                    (err, row) => err ? reject(err) : resolve(row)
                );
            });

            if (!request) {
                return reply.code(404).send({ status: 404, msg: "Friend request not found." });
            }

            if (accept === true || accept === "true") {
                await new Promise((resolve, reject) => {
                    db.run(
                        "UPDATE relationships SET status = 'ACCEPTED' WHERE id = ?",
                        [request_id],
                        (err) => err ? reject(err) : resolve()
                    );
                });

                // Notificar a ambos via WebSocket para que recarguen la lista
                userManager.broadcastFriendUpdate(request.user_id, userId);

                LOGGER(200, "friends.js", "POST /respond", `Accepted request ${request_id}`);
                return reply.code(200).send({ status: 200, msg: "Friend request accepted!" });

            } else {
                await new Promise((resolve, reject) => {
                    db.run(
                        "DELETE FROM relationships WHERE id = ?",
                        [request_id],
                        (err) => err ? reject(err) : resolve()
                    );
                });

                LOGGER(200, "friends.js", "POST /respond", `Declined request ${request_id}`);
                return reply.code(200).send({ status: 200, msg: "Friend request declined." });
            }

        } catch (err) {
            LOGGER(500, "friends.js", "POST /respond", err.message);
            return reply.code(500).send({ status: 500, msg: "Internal server error." });
        }
    });

    // DELETE /api/friends/:friend_id - eliminar amigo
    fastify.delete('/:friend_id', { preHandler: authFromCookie }, async (req, reply) => {
        try {
            const userId = req.user.getId();
            const friendId = parseInt(req.params.friend_id);
            const db = userManager.db;

            await new Promise((resolve, reject) => {
                db.run(
                    `DELETE FROM relationships WHERE 
                    ((user_id = ? AND target_id = ?) OR (user_id = ? AND target_id = ?))
                    AND type = 'friend'`,
                    [userId, friendId, friendId, userId],
                    (err) => err ? reject(err) : resolve()
                );
            });

            LOGGER(200, "friends.js", "DELETE /:friend_id", `Removed friend ${friendId} from ${userId}`);
            return reply.code(200).send({ status: 200, msg: "Friend removed." });

        } catch (err) {
            LOGGER(500, "friends.js", "DELETE /:friend_id", err.message);
            return reply.code(500).send({ status: 500, msg: "Internal server error." });
        }
    });
}

module.exports = friendsHandler;