
function buildRegisterHandler(db, bcrypt, saltRounds, User, userManager) {

	return async function registerHandler(req, reply) {
		const body = req.body || {};
		const username = body.username;
		const display_name = body.display_name;
		const email = body.email;
		const password = body.password;

		if (!username || !display_name || !email || !password)
			return reply.code(400).send({ error: "Missing fields" });

		try {
			const hashed = await bcrypt.hash(password, saltRounds);

			const insert_result = await new Promise((resolve, reject) => {
				db.run(
					"INSERT INTO users (username, display_name, email, password) VALUES (?,?,?,?)",
					[username, display_name, email, hashed],
					function(err) {
						if (err) reject(err);
						else resolve(this);
					}
				);
			});

/* 			const player = new User({
				id: insert_result.lastID,
				username: username,
				display_name: display_name,
				socket: null
			});
			
			userManager.addUser(player); */

			return reply.code(201).send({ ok: true });
		}
		catch (err) {
			console.error("Error registering user.", err);

			if (err.message && err.message.includes("UNIQUE constraint failed"))
				return reply.code(409).send({ error: "An account with same username/email already exists" });

			return reply.code(500).send({ error: "Internal server error" });
		}
	};
};

module.exports = { buildRegisterHandler };
