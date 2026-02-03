function changeAvatar(userManager, fastify, db) {
    return async function (req, reply) {
        const { avatar } = req.body;
        
        if (!avatar || avatar.trim() === "") {
            return reply.code(400).send({ error: "Avatar cannot be empty" });
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
                    "UPDATE users SET avatar = ? WHERE id = ?;", 
                    [avatar, decoded.id],
                    function (err) {
                        if (err) reject(err);
                        else resolve(this.changes);
                    }
                );
            });
            const userInMemory = userManager.getUserByID(decoded.id);
            if (userInMemory) {
                userInMemory.avatar = avatar; 
            }
            if (changes === 0) {
                return reply.code(404).send({ error: "User not found or avatar is identical" });
            }
            return reply.code(200).send({ status: 0, msg: "Avatar Updated Successfully" });

        } catch (err) { 
            fastify.log.error(err);
            return reply.code(500).send({ error: "Database error" });
        }
    }
}

module.exports = changeAvatar;