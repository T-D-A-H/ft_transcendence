

function buildLoginHandler(db, bcrypt, jwt, SECRET, userManager) {

	return async function handleLogin(req, reply) {
		const { display_name, password } = req.body || {};

		if (!display_name || !password)
			return reply.code(400).send({ error: "Missing fields" });

		try {
			const user = await new Promise((resolve, reject) => {
				db.get(
					"SELECT id, display_name, password FROM users WHERE display_name = ?",
					[display_name],
					(err, row) => err ? reject(err) : resolve(row)
				);
			});

			if (!user)
				return reply.code(401).send({ error: "Invalid credentials" });

			const match = await bcrypt.compare(password, user.password);
			if (!match)
				return reply.code(401).send({ error: "Invalid credentials" });

			const token = jwt.sign(
				{ id: user.id, display_name: user.display_name },
				SECRET,
				{ expiresIn: "1h" }
			);

			userManager.loginUser(user.id);

			return reply.send({ status: true, token });
		}
		catch (err) {
			console.error("Login error:", err);
			return reply.code(500).send({ error: "Database error" });
		}
	};
}

module.exports = buildLoginHandler;
