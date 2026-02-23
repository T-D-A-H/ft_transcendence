async function changeEmail(db, userId, newEmail) {

    if (!newEmail || newEmail.trim() === "") {
        return { status: 400, msg: "Email cannot be empty" };
    }

    const cleanEmail = newEmail.trim().toLowerCase();

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!emailRegex.test(cleanEmail)) {
        return { 
            status: 400,
            msg: "Invalid email format (example: user@domain.com)"
        };
    }

    try {
        const changes = await new Promise((resolve, reject) => {
            db.run(
                "UPDATE users SET email = ? WHERE id = ?;", 
                [cleanEmail, userId],
                function (err) {
                    if (err) return reject(err);
                    resolve(this.changes);
                }
            );
        });

        if (changes === 0) {
            return { status: 400, msg: "Email is identical" };
        }

        return { status: 200, msg: "Email Updated" };

    } catch (err) {

        if (err.code === "SQLITE_CONSTRAINT") {
            return { status: 409, msg: "Email already exists" };
        }

        throw err;
    }
}

module.exports = changeEmail;