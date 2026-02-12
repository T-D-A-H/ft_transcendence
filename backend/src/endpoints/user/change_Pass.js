function changePass(fastify, db, bcrypt, saltRounds) {
	return async function (req, reply) {
        const { newPass, oldPass } = req.body;

        // ! ---- Validate Pass ----
/*         const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        
        if (!PASSWORD_REGEX.test(newPass)) {
            return reply.code(400).send({
                status: "error",
                error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo"
            });
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
            // ✅ Obtener password actual
            const user = await new Promise((resolve, reject) => {
                db.get(
                    "SELECT password FROM users WHERE id = ?",
                    [decoded.id],
                    (err, row) => err ? reject(err) : resolve(row)
                );
            });
            if (!user) {
                return reply.code(404).send({ error: "User not found" });
            }

            // ✅ Comparar oldPass con hash
            const match = await bcrypt.compare(oldPass, user.password);
            if (!match) {
                return reply.code(401).send({ error: "Your current password does not match" });
            }

            // ✅ Hashear nueva contraseña
            const hashed = await bcrypt.hash(newPass, saltRounds);

            // ✅ Update
            const changes = await new Promise((resolve, reject) => {
                db.run(
                    "UPDATE users SET password = ? WHERE id = ?;", 
                    [hashed, decoded.id],
                    function (err) {
                        if (err) reject(err);
                        else resolve(this.changes);
                    }
                );
            });

            if (changes === 0) {
                return reply.code(404).send({ error: "Password not updated" });
            }

            return reply.code(200).send({ status: 200, msg: "Password Updated" });

        } catch (err) {
            fastify.log.error(err);
            return reply.code(500).send({ error: "Database error" });
        }
    }
}

module.exports = changePass;