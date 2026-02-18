async function changeAvatar(userManager, db, userId, avatar) {

        
    if (!avatar || avatar.trim() === "") {
        return {status: 400, msg: "Avatar cannot be empty"};
    }

    const changes = await new Promise((resolve, reject) => {
        db.run(
            "UPDATE users SET avatar = ? WHERE id = ?;", 
            [avatar, userId],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            }
        );
    });
    if (changes === 0) {
        return {status: 404, msg: "Avatar is identical"};
    }
    const userInMemory = userManager.getUserByID(userId);
    if (!userInMemory) {
        return {status: 400, msg: "User not found"};
    }
    userInMemory.avatar = avatar; 
    return {status: 200, msg: "Avatar Updated Successfully"};
}

module.exports = changeAvatar;