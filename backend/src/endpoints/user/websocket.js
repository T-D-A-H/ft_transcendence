

const db = require("../../init_db.js");
const LOGGER = require("../../LOGGER.js");

function getMatchHistoryRequest(requestingUser, limit) {
  const userId = Number(requestingUser.getId());
  const parsedLimit = Number(limit);
  const limitValue = Number.isFinite(parsedLimit) ? parsedLimit : 20;

  const historySql = `
     SELECT
       m.id,
       m.player1_id,
       m.player2_id,
       m.score_p1,
       m.score_p2,
       m.winner_id,
       m.is_ai_match,
       strftime('%s', m.played_at) AS played_at,
       
       CASE WHEN m.player1_id = ? THEN m.score_p1 ELSE m.score_p2 END AS userScore,
       CASE WHEN m.player1_id = ? THEN m.score_p2 ELSE m.score_p1 END AS opponentScore,
       
       CASE 
         WHEN m.winner_id = ? THEN 'win'
         ELSE 'loss' 
       END AS result,
       
       CASE 
         WHEN m.is_ai_match = 1 THEN 'ai'
         WHEN m.player2_id IS NULL OR m.player1_id = m.player2_id THEN 'local' 
         ELSE 'online' 
       END AS mode,
       
       CASE
         WHEN m.is_ai_match = 1 THEN 'AI Bot'
         WHEN m.player2_id IS NULL OR m.player1_id = m.player2_id THEN 'Local Player'
         WHEN m.player1_id = ? THEN COALESCE(u2.display_name, 'Unknown')
         ELSE COALESCE(u1.display_name, 'Unknown')
       END AS opponent

     FROM matches m
     LEFT JOIN users u1 ON u1.id = m.player1_id
     LEFT JOIN users u2 ON u2.id = m.player2_id
     WHERE m.player1_id = ? OR m.player2_id = ?
     ORDER BY m.played_at DESC
     LIMIT ?
   `;

  db.all(
    historySql,
    [userId, userId, userId, userId, userId, userId, limitValue],
    (err, rows) => {
      if (err) {
        LOGGER(500, "game.js", "getMatchHistoryRequest", err.message);
        requestingUser.send({
          type: "MATCH_HISTORY_RESPONSE",
          status: 500,
          msg: "Database error.",
          target: [],
        });
        return;
      }
      
      const history = rows.map((row) => ({
        id: String(row.id),
        timestamp: row.played_at ? Number(row.played_at) * 1000 : Date.now(),
        durationMs: 0,
        mode: row.mode,
        opponent: row.opponent,
        userScore: row.userScore,
        opponentScore: row.opponentScore,
        result: row.result,
        tournamentId: null,
      }));
      
      requestingUser.send({
        type: "MATCH_HISTORY_RESPONSE",
        status: 200,
        msg: "Match history loaded.",
        target: history,
      });
    }
  );
}


function getInfoRequest(requestingUser, userManager, target) {
  const userId = Number(requestingUser.getId());
  
  // Cálculo robusto para la caja de detalles (Local vs Online)
  const statsSql = `
    SELECT
      -- Local Played: is_ai_match=1 OR player2_id IS NULL (Local 1v1 on same keyboard)
      SUM(CASE WHEN (is_ai_match = 1 OR player2_id IS NULL) THEN 1 ELSE 0 END) AS localGames,
      
      -- Local Won: Local Game AND Winner = ME
      SUM(CASE WHEN (is_ai_match = 1 OR player2_id IS NULL) AND winner_id = ? THEN 1 ELSE 0 END) AS localWins,
      
      -- Online Played: is_ai_match=0 AND player2_id NOT NULL
      SUM(CASE WHEN (is_ai_match = 0 AND player2_id IS NOT NULL) THEN 1 ELSE 0 END) AS onlineGames,
      
      -- Online Won: Online Game AND Winner = ME
      SUM(CASE WHEN (is_ai_match = 0 AND player2_id IS NOT NULL) AND winner_id = ? THEN 1 ELSE 0 END) AS onlineWins

    FROM matches
    WHERE player1_id = ? OR player2_id = ?
  `;

  db.get(statsSql, [userId, userId, userId, userId], (err, row) => {
    let stats = {
      local_played: 0,
      local_won: 0,
      online_played: 0,
      online_won: 0,
      tournaments_played: requestingUser.tournaments_played || 0,
      tournaments_won: requestingUser.tournaments_won || 0,
    };

    if (!err && row) {
      stats.local_played = row.localGames || 0;
      stats.local_won = row.localWins || 0;
      stats.online_played = row.onlineGames || 0;
      stats.online_won = row.onlineWins || 0;
    }

    requestingUser.send({
      type: "INFO_RESPONSE",
      status: 200,
      msg: "",
      target: {
        display_name: requestingUser.getDisplayName(),
        username: requestingUser.getUsername(),
        avatar: requestingUser.avatar,
        stats: stats,
      },
    });
  });
}

function getStatsRequest(requestingUser) {
  const userId = Number(requestingUser.getId());
  
  const base = {
    userId: String(userId),
    username: requestingUser.getUsername(),
    displayName: requestingUser.getDisplayName(),
    totalGames: 0,
    totalWins: 0,
    totalLosses: 0,
    localGames: 0,
    localWins: 0,
    localLosses: 0,
    onlineGames: 0,
    onlineWins: 0,
    onlineLosses: 0,
    tournamentGames: 0,
    tournamentWins: 0,
    tournamentLosses: 0,
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    lastMatchAt: null,
  };

  const statsSql = `
     SELECT
       COUNT(*) AS totalGames,
       
       -- Total Wins: Si el winner_id es mi ID
       SUM(CASE WHEN winner_id = ? THEN 1 ELSE 0 END) AS totalWins,
       
       -- Total Losses: Si el winner_id NO es mi ID (puede ser otro usuario, NULL (IA) o undefined)
       SUM(CASE WHEN (winner_id IS NULL OR winner_id != ?) THEN 1 ELSE 0 END) AS totalLosses,
       
       -- LOCAL: IA o Local (p2 NULL)
       SUM(CASE WHEN (is_ai_match = 1 OR player2_id IS NULL) THEN 1 ELSE 0 END) AS localGames,
       SUM(CASE WHEN (is_ai_match = 1 OR player2_id IS NULL) AND winner_id = ? THEN 1 ELSE 0 END) AS localWins,
       SUM(CASE WHEN (is_ai_match = 1 OR player2_id IS NULL) AND (winner_id IS NULL OR winner_id != ?) THEN 1 ELSE 0 END) AS localLosses,
       
       -- ONLINE: NO IA y p2 existe
       SUM(CASE WHEN (is_ai_match = 0 AND player2_id IS NOT NULL) THEN 1 ELSE 0 END) AS onlineGames,
       SUM(CASE WHEN (is_ai_match = 0 AND player2_id IS NOT NULL) AND winner_id = ? THEN 1 ELSE 0 END) AS onlineWins,
       SUM(CASE WHEN (is_ai_match = 0 AND player2_id IS NOT NULL) AND winner_id != ? THEN 1 ELSE 0 END) AS onlineLosses,
       
       -- Puntos
       SUM(CASE WHEN player1_id = ? THEN score_p1 ELSE score_p2 END) AS pointsFor,
       SUM(CASE WHEN player1_id = ? THEN score_p2 ELSE score_p1 END) AS pointsAgainst,
       
       MAX(strftime('%s', played_at)) AS lastMatchAt
     FROM matches
     WHERE player1_id = ? OR player2_id = ?
   `;

  db.get(
    statsSql,
    [userId, userId, userId, userId, userId, userId, userId, userId, userId, userId],
    (err, row) => {
      if (err || !row) {
        LOGGER(500, "game.js", "getStatsRequest", "Database error or empty: " + (err ? err.message : ""));
        requestingUser.send({
          type: "STATS_RESPONSE",
          status: 200,
          msg: "Stats loaded.",
          target: base,
        });
        return;
      }

      const stats = {
        ...base,
        totalGames: row.totalGames || 0,
        totalWins: row.totalWins || 0,
        totalLosses: row.totalLosses || 0,
        
        localGames: row.localGames || 0,
        localWins: row.localWins || 0,
        localLosses: row.localLosses || 0,
        
        onlineGames: row.onlineGames || 0,
        onlineWins: row.onlineWins || 0,
        onlineLosses: row.onlineLosses || 0,
        
        local_played: row.localGames || 0,
        local_won: row.localWins || 0,
        online_played: row.onlineGames || 0,
        online_won: row.onlineWins || 0,
        
        tournaments_played: requestingUser.tournaments_played || 0, 
        tournaments_won: requestingUser.tournaments_won || 0,

        pointsFor: row.pointsFor || 0,
        pointsAgainst: row.pointsAgainst || 0,
        lastMatchAt: row.lastMatchAt ? Number(row.lastMatchAt) * 1000 : null,
      };

      const streakSql = `
       SELECT winner_id
       FROM matches
       WHERE (player1_id = ? OR player2_id = ?)
       ORDER BY played_at ASC
     `;

      db.all(streakSql, [userId, userId], (streakErr, rows) => {
        if (!streakErr && rows && rows.length > 0) {
          let best = 0;
          let current = 0;
          
          for (const r of rows) {
            if (r.winner_id === userId) {
              current += 1;
              best = Math.max(best, current);
            } else {
              current = 0;
            }
          }
          
          stats.bestWinStreak = best;
          stats.currentWinStreak = current;
        }
        
        requestingUser.send({
          type: "STATS_RESPONSE",
          status: 200,
          msg: "Stats loaded.",
          target: stats,
        });
      });
    }
  );
}

function updateSingularGameMoves(user, match, moveDir) {

	const index = match.players.indexOf(user);

	if (index === -1) return;

	if (moveDir === "UP") {

		match.YDir[index] = -1;
	}
	else if (moveDir === "DOWN") {

		match.YDir[index] = 1;
	}
	else if (moveDir === "STOP") {

		match.YDir[index] = 0;
	}
		
}
    
function updateDualGameMoves(match, moveDir) {

	if (moveDir === "UP1") {

        match.YDir[0] = -1;
	}
	else if (moveDir === "DOWN1") {

        match.YDir[0] = 1;
	}
	else if (moveDir === "STOP1") {

        match.YDir[0] = 0;
	}
	else if (moveDir === "UP2") {

    	match.YDir[1] = -1;
	}
	else if (moveDir === "DOWN2") {

        match.YDir[1] = 1;
	}
	else if (moveDir === "STOP2") {

        match.YDir[1] = 0;
	}
}

async function websocketHandler(fastify, options) {

	const { authFromCookie } = options;

	fastify.get('/', {websocket: true, preHandler: authFromCookie}, async (conn, req) => {

		const user = req.user;

		if (!user) {
			conn.socket.close(1008, 'Unauthorized');
			return ;
		}
		user.connect(conn.socket);
		user.socket.on("message", (raw) => {

	    	let msg;

	    	try {

			    msg = JSON.parse(raw);

	    	} catch (err) {

			    return ;
	    	}
			const match = user.getCurrentMatch();

			if (msg.type === "MOVE2" && match !== null) {

				updateDualGameMoves(match, msg.move);
			}
			else if (msg.type === "MOVE" && match !== null) {

				updateSingularGameMoves(user, match, msg.move);
			}
      else if (msg.type === "STATS_REQUEST") {

          getStatsRequest(user);
      }
      else if (msg.type === "MATCH_HISTORY_REQUEST") {

          getMatchHistoryRequest(user, msg.target); 
      }
		});
	});
};


module.exports = websocketHandler;