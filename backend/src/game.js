const LOGGER = require("./LOGGER.js");
const db = require("./init_db.js");

// ----------------------------------------------------------------------------
// LOGICA DE INVITACIONES Y PARTIDAS
// ----------------------------------------------------------------------------

function sendInviteRequest(requestingUser, userManager, username_to_send) {
  if (requestingUser.getCurrentMatch() === null) {
    userManager.createMatch(requestingUser, false, null);
  }
  const user_to_send = userManager.getUserByUsername(username_to_send);
  if (user_to_send === null) {
    requestingUser.send({
      type: "SEND_INVITE_RESPONSE",
      status: 400,
      msg: username_to_send + " is either not online or doesnt exist.",
      target: username_to_send,
    });
  } else if (user_to_send.getIsConnected() === false) {
    requestingUser.send({
      type: "SEND_INVITE_RESPONSE",
      status: 400,
      msg: username_to_send + " is not online.",
      target: username_to_send,
    });
  } else {
    user_to_send.addPendingRequest(
      requestingUser,
      requestingUser.getUsername()
    );
    requestingUser.send({
      type: "SEND_INVITE_RESPONSE",
      status: 200,
      msg: "Sent invite to play with " + username_to_send,
      target: username_to_send,
    });
    user_to_send.send({
      type: "INCOMING_INVITE_REQUEST",
      msg: requestingUser.getUsername() + " sent you an invite request.",
      target: requestingUser.getUsername(),
    });
  }
}

function replyToInviteRequest(
  requestingUser,
  userManager,
  username_to_send,
  acceptance
) {
  if (requestingUser.hasPendingRequest(username_to_send) === false) {
    requestingUser.send({
      type: "REPLY_INVITE_RESPONSE",
      status: 400,
      msg: "Couldnt find user in list.",
      target: null,
    });
    return;
  }
  const user_to_send = userManager.getUserByUsername(username_to_send);
  if (user_to_send === null) {
    requestingUser.send({
      type: "REPLY_INVITE_RESPONSE",
      status: 307,
      msg: username_to_send + " couldnt find user.",
      target: user_to_send.getDisplayName(),
    });
    requestingUser.removePendingRequest(username_to_send);
    return;
  }
  if (acceptance === "decline") {
    user_to_send.send({
      type: "NOTIFICATION",
      status: 200,
      msg: requestingUser.getUsername() + " declined your invite.",
      target: requestingUser.getUsername(),
    });
    requestingUser.send({
      type: "REPLY_INVITE_RESPONSE",
      status: 307,
      msg: "You declined " + username_to_send + "'s invite.",
      target: user_to_send.getDisplayName(),
    });
    requestingUser.removePendingRequest(username_to_send);
    return;
  }
  if (user_to_send.getIsConnected() === false) {
    requestingUser.send({
      type: "REPLY_INVITE_RESPONSE",
      status: 307,
      msg: username_to_send + " is offline.",
      target: username_to_send,
    });
    requestingUser.removePendingRequest(username_to_send);
    return;
  }
  if (
    user_to_send.getIsPlaying() === true ||
    user_to_send.getCurrentTournament() !== null
  ) {
    requestingUser.send({
      type: "REPLY_INVITE_RESPONSE",
      status: 400,
      msg: username_to_send + " is currently in a match. Try Later.",
      target: user_to_send.getDisplayName(),
    });
    return;
  }
  userManager.addToMatch(requestingUser, user_to_send.getCurrentMatch());
  requestingUser.send({
    type: "REPLY_INVITE_RESPONSE",
    status: 200,
    msg: "You accepted " + username_to_send + "'s invite.",
    target: user_to_send.getDisplayName(),
  });
  requestingUser.removePendingRequest(username_to_send);
}

function startMatchRequest(requestingUser, userManager) {
  const match = requestingUser.getCurrentMatch();
  if (!match) {
    requestingUser.send({
      type: "START_MATCH_RESPONSE",
      status: 400,
      msg: "You are not in a match.",
      target: requestingUser.getDisplaySide(),
    });
    return;
  }
  match.setReady(requestingUser);
  if (match.isReady[0] && match.isReady[1]) {
    if (match.locally === true) {
      LOGGER(200, "game.js", "startMatchRequest", "started local match");
      match.players[0].send({
        type: "START_MATCH_RESPONSE",
        status: 202,
        msg: "Started match against " + match.players[0].getUsername() + "2",
        target: "right",
      });
      return;
    }
    match.players[0].send({
      type: "START_MATCH_RESPONSE",
      status: 200,
      msg: "Started match against " + match.players[1].getUsername(),
      target: match.getPlayerSides(match.players[0]),
    });
    match.players[1].send({
      type: "START_MATCH_RESPONSE",
      status: 200,
      msg: "Started match against " + match.players[0].getUsername(),
      target: match.getPlayerSides(match.players[1]),
    });
  }
}

function playLocalGame(requestingUser, userManager) {
  if (requestingUser.getIsConnected() === false) {
    requestingUser.send({
      type: "PLAY_LOCALLY_RESPONSE",
      status: 400,
      msg: "You need to log in to be able to play.",
      target: "",
    });
  } else if (requestingUser.getCurrentMatch() !== null) {
    requestingUser.send({
      type: "PLAY_LOCALLY_RESPONSE",
      status: 400,
      msg: "You are already in another match.",
      target: "",
    });
  } else if (requestingUser.getCurrentTournament() !== null) {
    requestingUser.send({
      type: "PLAY_LOCALLY_RESPONSE",
      status: 400,
      msg: "You are already in another tournament.",
      target: "",
    });
  } else {
    const match = userManager.createMatch(requestingUser, true, null);
    userManager.addToMatch(requestingUser, match);
    requestingUser.send({
      type: "PLAY_LOCALLY_RESPONSE",
      status: 200,
      msg: "Local Match created.",
      target: "",
    });
  }
}

// ----------------------------------------------------------------------------
// LOGICA DE TORNEOS
// ----------------------------------------------------------------------------

function createTournamentRequest(
  requestingUser,
  userManager,
  userAlias,
  tournamentSize
) {
  const size = Number(tournamentSize);
  if (requestingUser.getCurrentTournament() !== null) {
    requestingUser.send({
      type: "CREATE_TOURNAMENT_RESPONSE",
      status: 400,
      msg: "You are already in a tournament.",
    });
  } else if (requestingUser.getCurrentMatch() !== null) {
    requestingUser.send({
      type: "CREATE_TOURNAMENT_RESPONSE",
      status: 400,
      msg: "You are already in a match.",
    });
  } else if (size < 2 || size > 64 || size % 2 != 0) {
    requestingUser.send({
      type: "CREATE_TOURNAMENT_RESPONSE",
      status: 400,
      msg: "Tournament sizes should be even numbers (2-64)",
    });
  } else {
    userManager.createTournament(requestingUser, userAlias, size);
    requestingUser.send({
      type: "CREATE_TOURNAMENT_RESPONSE",
      status: 200,
      msg: "Tournament created!",
    });
  }
}

function searchTournamentRequest(requestingUser, userManager) {
  const available_tournaments = userManager.getAvailableTournaments();
  if (available_tournaments === null) {
    requestingUser.send({
      type: "SEARCH_TOURNAMENT_RESPONSE",
      status: 400,
      msg: "No tournaments found.",
      target: [],
    });
  } else {
    requestingUser.send({
      type: "SEARCH_TOURNAMENT_RESPONSE",
      status: 200,
      msg: "Found tournaments.",
      target: available_tournaments,
    });
  }
}

function joinTournamentRequest(
  requestingUser,
  userManager,
  tournament_id,
  alias = null
) {
  if (requestingUser.getCurrentTournament() !== null) {
    requestingUser.send({
      type: "JOIN_TOURNAMENT_RESPONSE",
      status: 400,
      msg: "You are already in a tournament.",
    });
    return;
  } else if (requestingUser.getCurrentMatch() !== null) {
    requestingUser.send({
      type: "JOIN_TOURNAMENT_RESPONSE",
      status: 400,
      msg: "You are already in a match.",
    });
    return;
  }

  const tournament = userManager.getTournamentById(tournament_id);

  if (tournament === null) {
    requestingUser.send({
      type: "JOIN_TOURNAMENT_RESPONSE",
      status: 400,
      msg: "Couldnt find tournament.",
    });
    return;
  } else if (tournament.getIfTournamentFull()) {
    requestingUser.send({
      type: "JOIN_TOURNAMENT_RESPONSE",
      status: 400,
      msg: "Tournament already full.",
    });
  } else {
    LOGGER(
      200,
      "server",
      "joinTournamentRequest",
      "tournament found: " + tournament.getTournamentId()
    );

    if (
      userManager.addToTournament(requestingUser, tournament, alias) === false
    ) {
      requestingUser.send({
        type: "JOIN_TOURNAMENT_RESPONSE",
        status: 400,
        msg: "Couldnt find tournament.",
      });
      return;
    }
    requestingUser.send({
      type: "JOIN_TOURNAMENT_RESPONSE",
      status: 200,
      msg: "Joined " + tournament.getCreatorAlias() + "'s tournament.",
    });
    const creatorUser = tournament.getCreator();
    creatorUser.send({
      type: "NOTIFICATION",
      status: 200,
      msg:
        alias +
        " Joined the tournament. " +
        tournament.getCurrentSize() +
        "/" +
        tournament.getTournamentSize(),
    });
  }
}

function exitMatchRequest(requestingUser, userManager) {
  const match = requestingUser.getCurrentMatch();
  const tournament = requestingUser.getCurrentTournament();

  if (match === null && tournament === null) {
    requestingUser.send({
      type: "EXIT_MATCH_RESPONSE",
      status: 400,
      msg: "You are not in a match.",
      target: requestingUser.getUsername(),
    });
    return;
  }
  const other_user = requestingUser === match.players[0] ? 1 : 0;

  match.setWINNER(other_user);
  match.setLOSER(1 - other_user);
  match.setDisconnect();

  if (tournament !== null) {
    userManager.tournamentDisconnect(tournament);
    tournament.removeUserFromTournament(requestingUser);
    requestingUser.send({
      type: "EXIT_MATCH_RESPONSE",
      status: 200,
      msg: "Succesfully exited Tournament.",
      target: requestingUser.getUsername(),
    });
    return;
  }
  requestingUser.send({
    type: "EXIT_MATCH_RESPONSE",
    status: 200,
    msg: "Succesfully exited match.",
    target: requestingUser.getUsername(),
  });
}

// ----------------------------------------------------------------------------
// ESTADISTICAS Y PERFIL (MEJORADO)
// ----------------------------------------------------------------------------

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

function getPendingRequest(requestingUser) {
  const request_list = requestingUser.listPendingRequests();
  if (request_list === null) {
    requestingUser.send({
      type: "GET_PENDING_RESPONSE",
      status: 400,
      msg: "You have no pending requests.",
      target: null,
    });
    return;
  }
  requestingUser.send({
    type: "GET_PENDING_RESPONSE",
    status: 200,
    msg: "Pending request list updated.",
    target: request_list,
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

// ----------------------------------------------------------------------------
// MANEJO DE COMANDOS
// ----------------------------------------------------------------------------

function handleUserCommands(user, userManager) {
  user.socket.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (err) {
      return;
    }
    if (msg.type === "PING") {
      user.socket.send(JSON.stringify({ type: "PONG" }));
      return;
    }
    if (msg.type === "SEND_INVITE_REQUEST") {
      sendInviteRequest(user, userManager, msg.target);
    } else if (msg.type === "REPLY_INVITE_REQUEST") {
      replyToInviteRequest(user, userManager, msg.target, msg.target2);
    } else if (msg.type === "START_MATCH_REQUEST") {
      startMatchRequest(user, userManager);
    } else if (msg.type === "EXIT_MATCH_REQUEST") {
      exitMatchRequest(user, userManager);
    } else if (msg.type === "PLAY_LOCALLY_REQUEST") {
      playLocalGame(user, userManager);
    } else if (msg.type === "CREATE_TOURNAMENT_REQUEST") {
      createTournamentRequest(user, userManager, msg.target, msg.target2);
    } else if (msg.type === "SEARCH_TOURNAMENT_REQUEST") {
      searchTournamentRequest(user, userManager);
    } else if (msg.type === "JOIN_TOURNAMENT_REQUEST") {
      joinTournamentRequest(user, userManager, msg.target, msg.target2);
    } else if (msg.type === "INFO_REQUEST") {
      getInfoRequest(user, userManager, msg.target);
    } else if (msg.type === "GET_PENDING_REQUEST") {
      getPendingRequest(user);
    } else if (msg.type === "STATS_REQUEST") {
      getStatsRequest(user);
    } else if (msg.type === "MATCH_HISTORY_REQUEST") {
      getMatchHistoryRequest(user, msg.target);
    } else if (msg.type === "MOVE2" && user.currentMatch) {
      user.currentMatch.update2PlayerGame(msg.move);
    } else if (msg.type === "MOVE" && user.currentMatch) {
      user.currentMatch.updateGame(user, msg.move);
    }
  });
}

function buildGameSocketHandler(userManager) {
  return (socket, userId) => {
    if (!userId) {
      LOGGER(400, "buildGameSocketHandler:", "No userId provided");
      return socket.close(1008, "No user ID");
    }

    const user = userManager.getUserByID(userId);
    if (!user) {
      LOGGER(500, "server", "buildGameSocketHandler", "couldnt find user");
      return socket.close(1008, "User not found");
    }

    user.connect(socket);

    handleUserCommands(user, userManager);
  };
}

module.exports = buildGameSocketHandler;