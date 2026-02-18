async function changePass(db, bcrypt, saltRounds, userId, oldPass, newPass) {

        // ! ---- Validate Pass ----
/*         const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        
        if (!PASSWORD_REGEX.test(newPass)) {
            return reply.code(400).send({
                status: "error",
                error: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo"
            });
        } */
            // ✅ Obtener password actual
        const user = await new Promise((resolve, reject) => {
            db.get(
                "SELECT password FROM users WHERE id = ?",
                [userId],
                (err, row) => err ? reject(err) : resolve(row)
            );
        });
        if (!user) {
            return {status: 400, msg: "User not found"};
        }

        // ✅ Comparar oldPass con hash
        const match = await bcrypt.compare(oldPass, user.password);
        if (!match) {
            return {status: 401, msg: "Your current password does not match"};
        }

        // ✅ Hashear nueva contraseña
        const hashed = await bcrypt.hash(newPass, saltRounds);

        // ✅ Update
        const changes = await new Promise((resolve, reject) => {
            db.run(
                "UPDATE users SET password = ? WHERE id = ?;", 
                [hashed, userId],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });

        if (changes === 0) {
            return {status: 404, msg: "Password not updated"};
        }

        return {status: 200, msg: "Password Updated"};
}

module.exports = changePass;