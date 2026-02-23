async function changeUserName(userManager, db, userId, newName) {

    if (!newName || newName.trim() === "") {
        return {status: 400, msg: "New Username cannot be empty"};
    }

        // ! ---- Validate Username ----
    const cleanUsername = newName.trim();
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(cleanUsername)) {
        return reply.code(400).send({ 
            msg: "Invalid username. Only letters, numbers, and underscores are allowed (no spaces or emojis)" 
        });
    }

    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
        return reply.code(400).send({ msg: "El usuario debe tener entre 3 y 20 caracteres." });
    }
    
    const changes = await new Promise((resolve, reject) => {
        db.run(
            "UPDATE users SET username = ? WHERE id = ?;", 
            [cleanUsername, userId],
            function (err) {

                if (err) {
                    if (err.code === "SQLITE_CONSTRAINT") {
                        return resolve({ constraint: true });
                    }
                    return reject(err);
                }

                resolve({ changes: this.changes });
            }
        );
    });
    
    if (changes.constraint) {
        return { status: 409, msg: "Username already exists" };
    }

    if (changes.changes === 0) {
        return { status: 400, msg: "Username is identical" };
    }

    if (changes === 0) {
        return {status: 404, msg: "Username is identical"};
    }

    const userInMemory = userManager.getUserByID(userId);
    if (!userInMemory) {
        return {status: 400, msg: "User not found"};
    }
    userInMemory.updateUserName(cleanUsername);
    return {status: 200, msg: "User Name Updated"};
}

module.exports = changeUserName;