module.exports = function buildMatchResultHandler(db, fastify) {
  return async function matchResultHandler(request, reply) {
    const token = request.cookies?.accessToken;
    if (!token) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
    let decoded;
    try {
      decoded = fastify.jwt.verify(token);
    } catch {
      return reply.code(401).send({ error: "Invalid token" });
    }

    const { scorePlayer, scoreOpponent, opponentId } = request.body || {};
    const playerScore = Number(scorePlayer);
    const oppScore = Number(scoreOpponent);
    const oppId =
      opponentId === null || opponentId === undefined ? 0 : Number(opponentId);

    if (!Number.isFinite(playerScore) || !Number.isFinite(oppScore)) {
      return reply.code(400).send({ error: "Invalid scores" });
    }

    const winnerId =
      playerScore > oppScore
        ? decoded.id
        : oppScore > playerScore
          ? oppId
          : null;

    db.run(
      `INSERT INTO matches (player1_id, player2_id, score_p1, score_p2, winner_id, game_mode, is_ai_match)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [decoded.id, oppId, playerScore, oppScore, winnerId, "CLASSIC", 0],
      (err) => {
        if (err) {
          return reply.code(500).send({ error: "Failed to save match" });
        }
        return reply.send({ status: 200, msg: "Match saved" });
      },
    );
  };
};
