async function changeDisplayName(userManager, db, userId, newName ) {

    if (!newName || newName.trim() === "") {

        return {status: 400, msg: "Display Name cannot be empty"};
    }
    const changes = await new Promise((resolve, reject) => {
        db.run(
            "UPDATE users SET display_name = ? WHERE id = ?;", 
            [newName, userId],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            }
        );
    });

    if (changes === 0) {
        return {status: 404, msg: "Name is identical"};
    }

    const userInMemory = userManager.getUserByID(userId);
    if (!userInMemory) {
        return {status: 400, msg: "User not found"};
    }

    userInMemory.updateDisplayName(newName);
    return {status: 200, msg: "Display Name Updated"};

}

module.exports = changeDisplayName;