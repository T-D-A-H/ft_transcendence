function changeEmail(fastify, db) {
	return async function (req, reply) {
        const { newName } = req.body;
        if (!newName || newName.trim() === "") {
            return reply.code(400).send({ msg: "Name cannot be empty" });
        }
        // ! ---- Validate Email ----
        const cleanEmail = newName.trim().toLowerCase();

/*         const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        
        if (!emailRegex.test(cleanEmail)) {
            return reply.code(400).send({ 
                status: "error",
                msg: "Formato de correo electrónico inválido (ejemplo: usuario@dominio.com)" 
            });
        }
 */
        const token = req.cookies?.accessToken;
        if (!token) {
            return reply.code(401).send({ msg: "No token provided" });
        }

        let decoded;
        try {
            decoded = fastify.jwt.verify(token);
        } catch (err) {
            return reply.code(401).send({ msg: "Invalid token" });
        }

        try {
            const changes = await new Promise((resolve, reject) => {
                db.run(
                    "UPDATE users SET email = ? WHERE id = ?;", 
                    [cleanEmail, decoded.id],
                    function (err) {
                        if (err) reject(err);
                        else resolve(this.changes);
                    }
                );
            });

            if (changes === 0) {
                return reply.code(404).send({ msg: "User not found or name is identical" });
            }
            return reply.code(200).send({ status: 200, msg: "User Name Updated" });

        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: "Database error" });
        }
    }
}

module.exports = changeEmail;