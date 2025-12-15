function validateToken(userManager, fastify) {
    return async function (req, reply) {
        try {
            const token = req.cookies.accessToken;

            if (!token) {
                return reply.code(401).send({ valid: false });
            }

            const decoded = fastify.jwt.verify(token);
            const player = userManager.getUser(decoded.id);

            if (!player || !player.isConnected) {
                return reply.code(401).send({ valid: false });
            }

            return reply.send({ valid: true });
        } catch (err) {
            return reply.code(401).send({ valid: false });
        }
    };
}

module.exports = validateToken;
