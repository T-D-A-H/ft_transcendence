const User = require("../src/User.js");

function verify2FACode ( userManager, fastify) {
    return async function login2FAHandler(req, reply) {
        const { tempToken, code } = req.body;

        if (!tempToken || !code)
            return reply.code(400).send({ error: "Missing fields" });

        try {
            // Verificar token temporal
            const decoded = fastify.jwt.verify(tempToken);
            if (decoded.step !== "2fa_pending")
                return reply.code(401).send({ error: "Invalid token" });

            const userId = decoded.id;

            // Verificar código 2FA
            if (!userManager.verify2FACode(userId, code)) {
                return reply.code(401).send({ error: "Invalid or expired 2FA code" });
            }

            const player = new User({
                id: userId,
                username: decoded.username,
                display_name: decoded.display_name,
                socket: null
            });
            userManager.addUser(player);
            userManager.loginUser(player.id);

            // Emitir JWT final
            const token = fastify.jwt.sign({ id: player.id, display_name: player.display_name });

            return reply.send({ status: "ok", token });
        } catch (err) {
            console.error("2FA verification error:", err);
            return reply.code(401).send({ error: "Invalid or expired token" });
        }
    };
}

module.exports = verify2FACode;
