const User 		 = require("../Classes/User.js");

function changeDisplayName(userManager, fastify, db) {
	return async function (req, reply) {
        const { newName } = req.body;
        if (!newName || newName.trim() === "") {
            return reply.code(400).send({ error: "Name cannot be empty" });
        }

        const token = req.cookies?.accessToken;
        if (!token) {
            return reply.code(401).send({ error: "No token provided" });
        }

        let decoded;
        try {
            decoded = fastify.jwt.verify(token);
        } catch (err) {
            return reply.code(401).send({ error: "Invalid token" });
        }

        try {
            const changes = await new Promise((resolve, reject) => {
                db.run(
                    "UPDATE users SET display_name = ? WHERE id = ?;", 
                    [newName, decoded.id],
                    function (err) {
                        if (err) reject(err);
                        else resolve(this.changes);
                    }
                );
            });

            let player = userManager.getUserByID(decoded.id);
			if (!player) {

                player = new User({
                    id: decoded.id,
                    username: decoded.username,
                    display_name: decoded.display_name,
                    socket: null
                });
                userManager.addUser(player);
			}
            userManager.getUserByID(decoded.id).updateDisplayName(newName);

            if (changes === 0) {
                return reply.code(404).send({ error: "User not found or name is identical" });
            }
            return reply.code(200).send({ status: 200, msg: "Display Name Updated" });

        } catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: "Database error" });
        }
    }
}

module.exports = changeDisplayName;