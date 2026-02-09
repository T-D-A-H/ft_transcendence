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
    let oppId = (opponentId && opponentId > 0) ? Number(opponentId) : null;
    

    const isAi = !oppId; 

    if (!Number.isFinite(playerScore) || !Number.isFinite(oppScore)) {
      return reply.code(400).send({ error: "Invalid scores" });
    }

    const userId = decoded.id;
    const userWon = playerScore > oppScore;
    const winnerId = userWon ? userId : (oppId ? oppId : userId);

    const runQuery = (query, params) => {
        return new Promise((resolve, reject) => {
            db.run(query, params, function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    };

    try {
        await runQuery(
            `INSERT INTO matches (player1_id, player2_id, score_p1, score_p2, winner_id, game_mode, is_ai_match)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, oppId, playerScore, oppScore, winnerId, "CLASSIC", isAi ? 1 : 0]
        );

        let updateQuery = "";
        if (isAi) {
            if (userWon) {
                updateQuery = "UPDATE users SET local_played = local_played + 1, local_won = local_won + 1 WHERE id = ?";
            } else {
                updateQuery = "UPDATE users SET local_played = local_played + 1 WHERE id = ?";
            }
        } else {
            if (userWon) {
                updateQuery = "UPDATE users SET online_played = online_played + 1, online_won = online_won + 1 WHERE id = ?";
            } else {
                updateQuery = "UPDATE users SET online_played = online_played + 1 WHERE id = ?";
            }
        }

        await runQuery(updateQuery, [userId]);

        return reply.code(200).send({ status: 200, msg: "Match saved successfully" });

    } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: "Database error" });
    }
  };
};