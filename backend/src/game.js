// const LOGGER = require("./LOGGER.js");
// const db = require("./init_db.js");

// // ----------------------------------------------------------------------------
// // ESTADISTICAS Y PERFIL (MEJORADO)
// // ----------------------------------------------------------------------------




// // ----------------------------------------------------------------------------
// // MANEJO DE COMANDOS
// // ----------------------------------------------------------------------------

// function handleUserCommands(user, userManager) {
//   user.socket.on("message", (raw) => {
//     let msg;
//     try {
//       msg = JSON.parse(raw);
//     } catch (err) {
//       return;
//     }
//     if (msg.type === "PING") {
//       user.socket.send(JSON.stringify({ type: "PONG" }));
//       return;
//     }
//     if (msg.type === "SEND_INVITE_REQUEST") {
//       sendInviteRequest(user, userManager, msg.target);
//     } else if (msg.type === "REPLY_INVITE_REQUEST") {
//       replyToInviteRequest(user, userManager, msg.target, msg.target2);
//     } else if (msg.type === "START_MATCH_REQUEST") {
//       startMatchRequest(user, userManager);
//     } else if (msg.type === "EXIT_MATCH_REQUEST") {
//       exitMatchRequest(user, userManager);
//     } else if (msg.type === "PLAY_LOCALLY_REQUEST") {
//       playLocalGame(user, userManager);
//     } else if (msg.type === "CREATE_TOURNAMENT_REQUEST") {
//       createTournamentRequest(user, userManager, msg.target, msg.target2);
//     } else if (msg.type === "SEARCH_TOURNAMENT_REQUEST") {
//       searchTournamentRequest(user, userManager);
//     } else if (msg.type === "JOIN_TOURNAMENT_REQUEST") {
//       joinTournamentRequest(user, userManager, msg.target, msg.target2);
//     } else if (msg.type === "INFO_REQUEST") {
//       getInfoRequest(user, userManager, msg.target);
//     } else if (msg.type === "GET_PENDING_REQUEST") {
//       getPendingRequest(user);
//     } else if (msg.type === "STATS_REQUEST") {
//       getStatsRequest(user);
//     } else if (msg.type === "MATCH_HISTORY_REQUEST") {
//       getMatchHistoryRequest(user, msg.target);
//     } else if (msg.type === "MOVE2" && user.currentMatch) {
//       user.currentMatch.update2PlayerGame(msg.move);
//     } else if (msg.type === "MOVE" && user.currentMatch) {
//       user.currentMatch.updateGame(user, msg.move);
//     }
//   });
// }

// function buildGameSocketHandler(userManager) {
//   return (socket, userId) => {
//     if (!userId) {
//       LOGGER(400, "buildGameSocketHandler:", "No userId provided");
//       return socket.close(1008, "No user ID");
//     }

//     const user = userManager.getUserByID(userId);
//     if (!user) {
//       LOGGER(500, "server", "buildGameSocketHandler", "couldnt find user");
//       return socket.close(1008, "User not found");
//     }

//     user.connect(socket);

//     handleUserCommands(user, userManager);
//   };
// }

// module.exports = buildGameSocketHandler;