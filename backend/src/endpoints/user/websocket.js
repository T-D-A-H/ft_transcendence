

const db = require("../../init_db.js");
const LOGGER = require("../../LOGGER.js");


function updateSingularGameMoves(user, match, moveDir) {

	const index = match.players.indexOf(user);

	if (index === -1) return;

	if (moveDir === "UP") {

		match.YDir[index] = -1;
	}
	else if (moveDir === "DOWN") {

		match.YDir[index] = 1;
	}
	else if (moveDir === "STOP") {

		match.YDir[index] = 0;
	}
		
}
    
function updateDualGameMoves(match, moveDir) {

	if (moveDir === "UP1") {

        match.YDir[0] = -1;
	}
	else if (moveDir === "DOWN1") {

        match.YDir[0] = 1;
	}
	else if (moveDir === "STOP1") {

        match.YDir[0] = 0;
	}
	else if (moveDir === "UP2") {

    	match.YDir[1] = -1;
	}
	else if (moveDir === "DOWN2") {

        match.YDir[1] = 1;
	}
	else if (moveDir === "STOP2") {

        match.YDir[1] = 0;
	}
}

async function websocketHandler(fastify, options) {

	const { authFromCookie, userManager } = options;

	fastify.get('/', {websocket: true, preHandler: authFromCookie}, async (conn, req) => {

		const user = req.user;

		if (!user) {
			conn.socket.close(1008, 'Unauthorized');
			return ;
		}
		user.connect(conn.socket);
		user.socket.on("message", (raw) => {

	    	let msg;

	    	try {

			    msg = JSON.parse(raw);

	    	} catch (err) {

			    return ;
	    	}
			const match = user.getCurrentMatch();

			if (msg.type === "MOVE2" && match !== null) {

				updateDualGameMoves(match, msg.move);
			}
			else if (msg.type === "MOVE" && match !== null) {

				updateSingularGameMoves(user, match, msg.move);
			}
		});
     conn.socket.on("close", async () => {
        try {
            const db = userManager.db;
            if (!db) return;

            const rows = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT 
                        CASE WHEN user_id = ? THEN target_id ELSE user_id END as friend_id
                    FROM relationships
                    WHERE (user_id = ? OR target_id = ?)
                      AND type = 'friend'
                      AND status = 'ACCEPTED'`,
                    [user.getId(), user.getId(), user.getId()],
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
            console.error("Error notifying friends on disconnect:", err);
        }
    });
	});
};


module.exports = websocketHandler;