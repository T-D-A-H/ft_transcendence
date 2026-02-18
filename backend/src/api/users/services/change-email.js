async function changeEmail(db, userId, newName) {


    if (!newName || newName.trim() === "") {
        return {status: 400, msg: "Email cannot be empty"};
    }
    // ! ---- Validate Email ----
    const cleanEmail = newName.trim().toLowerCase();

/* const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        
    if (!emailRegex.test(cleanEmail)) {
        return reply.code(400).send({ 
            status: "error",
            msg: "Formato de correo electrónico inválido (ejemplo: usuario@dominio.com)" 
        });
    }
 */
    const changes = await new Promise((resolve, reject) => {
        db.run(
            "UPDATE users SET email = ? WHERE id = ?;", 
            [cleanEmail, userId],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            }
        );
    })
    if (changes === 0) {
        return {status: 404, msg: "Email is identical"};
    }
    return {status: 200, msg: "Email Updated"};

}

module.exports = changeEmail;