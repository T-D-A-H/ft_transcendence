function refreshToken(userManager, fastify, setTokenCookie) {
    return async function (req, reply) {
        try {
            const token = req.cookies.accessToken;

            if (!token) {
                return reply.code(401).send({ status: "error", error: "No token" });
            }

            const decoded = fastify.jwt.verify(token);
            const player = userManager.getUser(decoded.id);

            if (!player) {
                return reply.code(401).send({ status: "error", error: "User not found" });
            }

            const newToken = fastify.jwt.sign({
                id: decoded.id,
                display_name: decoded.display_name
            });

            setTokenCookie(reply, newToken);
            return reply.send({ status: "ok" });

        } catch (err) {
            return reply.code(401).send({ status: "error", error: "Token invalid" });
        }
    };
}

module.exports = refreshToken;
