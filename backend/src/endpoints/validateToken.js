function validateToken(userManager, fastify, setTokenCookie) {
    return async function (req, reply) {
        const token = req.cookies?.accessToken;

        if (!token) {
            return reply.code(401).send({ valid: false });
        }

        try {
            // 1. Verificamos el token actual
            const decoded = fastify.jwt.verify(token);
            
            // 2. Comprobamos si el usuario sigue existiendo en memoria/BD
            const user = userManager.getUserByID(decoded.id);
            if (!user) {
                return reply.code(401).send({ valid: false });
            }

            // Creamos un token NUEVO con los mismos datos
            const newToken = fastify.jwt.sign(
                { 
                id: decoded.id, 
                username: decoded.username || user.username,
                display_name: decoded.display_name || user.display_name
                },
                { expiresIn: "7d" }
            );

            setTokenCookie(reply, newToken);

            // =========================================================

            return reply.send({ valid: true });

        } catch (err) {
            return reply.code(401).send({ valid: false });
        }
    }
}

module.exports = validateToken;