function changeUserName(userManager, fastify, db) {
	return async function (req, reply) {
        const { newName } = req.body;
        if (!newName || newName.trim() === "") {
            return reply.code(400).send({ error: "Name cannot be empty" });
        }

        // ! ---- Validate Username ----
        const cleanUsername = newName.trim();
/*         const usernameRegex = /^[a-zA-Z0-9_]+$/;

        if (!usernameRegex.test(cleanUsername)) {
            return reply.code(400).send({ 
                error: "Invalid username. Only letters, numbers, and underscores are allowed (no spaces or emojis)" 
            });
        }

        if (cleanUsername.length < 3 || cleanUsername.length > 20) {
            return reply.code(400).send({ error: "El usuario debe tener entre 3 y 20 caracteres." });
        } */

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
                    "UPDATE users SET username = ? WHERE id = ?;", 
                    [cleanUsername, decoded.id],
                    function (err) {
                        if (err) reject(err);
                        else resolve(this.changes);
                    }
                );
            });

            if (changes === 0) {
                return reply.code(404).send({ error: "User not found or name is identical" });
            }

            const userInMemory = userManager.getUserByID(decoded.id);
            if (userInMemory) {
                userInMemory.updateUserName(cleanUsername);
            }

            return reply.code(200).send({ status: 200, msg: "User Name Updated" });

        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: "Database error" });
        }
    }
}

module.exports = changeUserName;