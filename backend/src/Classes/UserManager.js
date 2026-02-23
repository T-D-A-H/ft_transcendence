const User = require("./User.js");
const Match = require("./Match.js");
const LOGGER = require("../LOGGER.js");
const Tournament = require("./Tournament.js");
const blockchainService = require("./BlockchainService.js");
const StatsManager = require("./StatsManager.js");

class UserManager {

    constructor(db) {
        LOGGER(200, "UserManager", "Constructor", "Called");
        this.db = db;
        this.users = new Map();
        this.matches = new Map();
        this.tournaments = new Map();
        this.pending2FA = new Map();
        
        this.matchHistory = new Map();
        this.stats = new StatsManager(db);
        
        // AÑADIDO: Flags de estado para Blockchain
        this.blockchainEnabled = false;
        this.blockchainInitialized = false;
    }

//----------------------------------------------------------------------------------------API CALLS

    broadcastFriendUpdate(userId1, userId2) {
        const user1 = this.getUserByID(userId1);
        const user2 = this.getUserByID(userId2);
        if (user1 && user1.getIsConnected()) {
            user1.notify("FRIEND_UPDATE", "Friends list changed", null);
        }
        if (user2 && user2.getIsConnected()) {
            user2.notify("FRIEND_UPDATE", "Friends list changed", null);
        }
    }

    // AÑADIDO: Método para inicializar la conexión con Blockchain
    async initializeBlockchain() {
        try {
            await blockchainService.initialize();
            this.blockchainEnabled = true;
            this.blockchainInitialized = true;
            LOGGER(200, "UserManager", "initializeBlockchain", "Blockchain service initialized");
        } catch (error) {
            LOGGER(400, "UserManager", "initializeBlockchain", "Failed to initialize blockchain: " + error.message);
            this.blockchainEnabled = false;
        }
    }

//----------------------------------------------------------------------------------------USER

    saveGameStatsToDB(userId, resultType, isWin) {
        if (!this.db)
            return;
        LOGGER(200, userId, resultType, isWin);
        let query = "";
        const streakLogic = isWin 
            ? ", current_streak = current_streak + 1, best_streak = MAX(best_streak, current_streak + 1)" 
            : ", current_streak = 0";

        if (resultType === "online") {
            query = `UPDATE stats SET online_played = online_played + 1, matches = matches + 1 ${isWin ? ", online_won = online_won + 1,total_wins = total_wins + 1 " : ""} ${streakLogic} WHERE user_id = ?`;
        }
        else if (resultType === "local") {
            // Normalmente en local no contamos rachas globales, pero depende de tu juego. Asumimos que sí.
            query = `UPDATE stats SET local_played = local_played + 1, matches = matches + 1 ${isWin ? ", local_won = local_won + 1" : ""} WHERE user_id = ?`;
        }
        else if (resultType === "tournament") {
             query = `UPDATE stats SET tournaments_played = tournaments_played + 1, matches = matches + 1 ${isWin ? ", tournaments_won = tournaments_won + 1, total_wins = total_wins + 1" : ""} ${streakLogic} WHERE user_id = ?`;
        }
        // else if (resultType === "ai") {
        //     query = `UPDATE stats SET ai_played = ai_played + 1, matches = matches + 1 ${isWin ? ", ai_won = ai_won + 1" : ""} WHERE user_id = ?`;
        // }

        if (query) {
            this.db.run(query, [userId], (err) => { 
                if (err) console.error("Error saving stats for user " + userId, err); 
            });
        }
    }
    
    incrementTournamentPlayedDB(userId) {
        if (!this.db) return;
        const query = "UPDATE stats SET tournaments_played = tournaments_played + 1 WHERE user_id = ?";
        
        this.db.run(query, [userId], (err) => {
            if (err) console.error("Error updating tournaments_played:", err);
        });
    }

    isUserConnected(userId) {
        const user = this.users.get(userId);
        return user ? user.getIsConnected() : false;
    }

    forceDisconnect(userId) {
        if (this.users.has(userId)) {
            const userSession = this.users.get(userId);
            if (userSession.socket) {
                userSession.socket.close(1000, "New login detected"); 
            }
            this.users.delete(userId);
            return true;
        }
        return false;
    }

    set2FACode(userId, code) {
        const expiresAt = Date.now() + 5 * 60 * 1000; 
        this.pending2FA.set(userId, { code, expiresAt });
    }

    verify2FACode(userId, code) {
        const record = this.pending2FA.get(userId);
        if (!record) return false;

        if (record.expiresAt < Date.now()) {
            this.pending2FA.delete(userId);
            return false;
        }
        if (record.code !== Number(code)) return false;

        this.pending2FA.delete(userId);
        return true;
    }

    createUser(user_id, user_name, display_name, user_socket) {
        LOGGER(200, "UserManager", "createUser", "Created");
        const user = new User({
            id: user_id,
            username: user_name,
            display_name: display_name,
            socket: user_socket
        });
        return (user);
    }

    addUser(user) {
        LOGGER(200, "UserManager", "addUser", user.getUsername());
        this.users.set(user.id, user);
    }

    removeUser(userId) {
        LOGGER(200, "UserManager", "removeUser", this.users.get(userId));
        const removed = this.users.delete(userId);
        return (removed);
    }

    loginUser(userId) {
        const user = this.users.get(userId);
        if (user && user.isConnected == false) {
            LOGGER(200, "UserManager", "loginUser", user.getUsername());
            user.setConnected(true);
            return true;
        }
        LOGGER(400, "UserManager", "loginUser", user.getUsername() + "already logged in.");
        return false;
    }

    logoutUser(userId) {
        const user = this.users.get(userId);
        if (user) { LOGGER(200, "UserManager.js", "logoutUser", user.getUsername());

            user.setConnected(false);
            this.disconnectUser(user)
            return true;
        }
        LOGGER(400, "UserManager.js", "logoutUser", userId + "already logged out.");
        return false;
    }

    disconnectUser(user) {

        const match = user.getCurrentMatch();
        const tournament = user.getCurrentTournament();
        const userId = user.getId();

        if (match) {


            if (match.size !== 2) {
                this.stopMatch(match);
                return ;
            }

            if (match.getType() === "2player") {

                // 4. Limpiar estado de jugadores
                match.players[0].notify("WIN", ``);
                match.players.forEach(p => {
                    if (p) {
                        p.setMatch(null);
                        p.setIsPlaying(false);
                    }
                });
                this.removeMatch(match);
                return;
            }

            let loserIndex = match.players.indexOf(user);
            let winnerIndex = 1 - loserIndex;
            let loserAlias = user.getDisplayName();

            match.players[winnerIndex].notify("NOTIFICATION", `${loserAlias} disconnected.`);
            match.setWINNER(winnerIndex);
            match.setLOSER(loserIndex);
            this.stopMatch(match);
        }
        if (tournament) {

            if (tournament.getWinners().has(userId)) {

                tournament.deleteWinner(userId);
            }
            console.log(tournament.getCreator());
            if (tournament.getCreator() == userId && tournament.getIsWaiting() === true) {

                tournament.creatorId = null;
                this.removeTournament(tournament.getId());
                let ids = tournament.getPlayers();
                for (const id of ids.keys()) {
                    const user = this.getUserByID(id);
                    user.setTournament(null);
                    user.setMatch(null);
                    user.setIsPlaying(false);
                    user.notify("WIN", "Creator Disbanded the Tournament.");
                    tournament.removePlayer(id);
                }
            }
            tournament.removePlayer(userId);
        }
        user.setTournament(null);
    }

    sendMirror(match) {
        match.players.forEach(user => {
            if (user && typeof user !== 'string' && user.getDisplaySide) {
                if (user.getDisplaySide() === match.getPlayerSides(user)) {
                    user.notify("MIRROR", null, null);
                }
            }
        });
    }

    sendGameReady(match) { LOGGER(200, "UserManager.js", "sendGameReady", "Sent to match: " + match.id);

        const user1 = match.players[0];
        const user2 = match.players[1];
        const tournament = match.tournament;

        if (tournament !== null) {


            user1.notify("GAME_READY", "Game Starting", {
                type: "tournament",
                tournament_id: tournament.getId(),
                match_id: match.getId(),
                self_displayname: tournament.getPlayerAlias(user1.getId()), 
                opponent_display_name: tournament.getPlayerAlias(user2.getId()),
                opponent_avatar: user2.getAvatar()
                
            });
            user2.notify("GAME_READY", "Game Starting", {
                type: "tournament",
                tournament_id: tournament.getId(),
                match_id: match.getId(),
                self_displayname: tournament.getPlayerAlias(user2.getId()), 
                opponent_display_name: tournament.getPlayerAlias(user1.getId()), 
                opponent_avatar: user1.getAvatar()
            });
        }
        else {

            user1.notify("GAME_READY", "Game Starting", {
                type: match.getType(),
                match_id: match.getId(),
                id: user2.getId(), 
                display_name: user2.getDisplayName(), 
                username: user2.getUsername(),
                opponent_avatar: user2.getAvatar()
                
            });
            user2.notify("GAME_READY", "Game Starting", {
                type: match.getType(),
                match_id: match.getId(),
                id: user1.getId(), 
                display_name: user1.getDisplayName(), 
                username: user1.getUsername(), 
                opponent_avatar: user1.getAvatar()
            });
        }
    }
//----------------------------------------------------------------------------------------USER
//----------------------------------------------------------------------------------------MATCH
	createMatch(user, matchType, tournament, visibility) { LOGGER(200, "UserManager.js", "createMatch", user.getUsername());
        
        const match_id = this.createId();
		const match = new Match(user, match_id, matchType, tournament, visibility);

        this.matches.set(match_id, match);
        return (match);
	}

    addToMatch(requestingUser, match) { 

        match.addUserToMatch(requestingUser);
        requestingUser.setMatch(match);
    }

	removeMatch(match) { LOGGER(200, "UserManager.js", "removeMatch", match.id);
		this.matches.delete(match.id);
	}

    stopMatch(match) {
        LOGGER(200, "UserManager.js", "stopMatch", "called");

        const tournament = match.getTournament();
        const winnerUser = match.getWinner();
        const loserUser  = match.getLoser();
        const players    = match.getPlayers();
        const scores     = match.getScores();
        const matchType  = match.getMatchType();

        // 1. Guardar historial en DB
        if (this.db && players?.[0] && scores && winnerUser) {
            const p1_id = players[0]?.getId() ?? null;
            const p2_id = (matchType === "2player" || matchType.startsWith("ai"))
                ? null
                : (players[1]?.getId() ?? null);
            let w_id = winnerUser.getId();
			if (matchType === "2player") {
                if (scores[1] > scores[0]) {
                    w_id = p1_id;
                }  else
                    w_id = p2_id;
            }
            this.db.run(
                `INSERT INTO matches (player1_id, player2_id, score_p1, score_p2, winner_id, game_mode, played_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [p1_id, p2_id, scores[0], scores[1], w_id, matchType],
                (err) => { if (err) console.error("Error inserting match history:", err); }
            );
            
        }

        // 2. Actualizar estadísticas según el tipo de partida
        if (matchType === "2player") {
            // LOCAL: 1 usuario real vs guest
            const user = players[0];
            if (user) {
                const userWon = this.stats._handleLocal(user, scores);
                user.notify("WIN", userWon ? "You won the local match!" : "You lost the local match!");
            }

        } else if (winnerUser && loserUser) {
            // ONLINE o TORNEO (2 jugadores reales)
            const type = tournament ? "tournament" : "online";
            this.stats.handleMatchEnd(type, winnerUser, loserUser);

            winnerUser.notify("WIN", `You won against ${loserUser.getDisplayName()}`);
            loserUser.notify("WIN", `You lost against ${winnerUser.getDisplayName()}`);
        }

        // 3. Lógica de torneo: actualizar ronda
        if (tournament && winnerUser && loserUser) {
            tournament.updateWinner(match.getId(), winnerUser.getId());
            let ids = tournament.getPlayers();
            for (const id of ids.keys()) {
                const userX = this.getUserByID(id);
                userX.notify("NOTIFICATION", `${winnerUser.getDisplayName()} won round against ${loserUser.getDisplayName()}`)
            }
            tournament.sendLose(loserUser, winnerUser);
            loserUser.unsetTournament();
        }

        // 4. Limpiar estado de jugadores
        players.forEach(p => {
            if (p) {
                p.setMatch(null);
                p.setIsPlaying(false);
            }
        });

        this.sendMirror(match);
        this.removeMatch(match);
    }

    updateMatches() {

        this.matches.forEach(match => {

            if (match.getSTARTED() === false) {

                if (match.isFull() && match.isWaiting === true) {
                    match.setWaiting(false);
                    match.players[0].setIsPlaying(true);
                    match.players[1].setIsPlaying(true);
                    this.sendGameReady(match);
                }
                else if (match.playersReady()) {

                    match.setSTARTED(true);
                    this.sendMirror(match);
                }
            }
            else {
                
                if (match.someoneWon() === true) {
                    this.stopMatch(match)
                }
                if (match.shouldContinuePlaying()) {
				    match.updateMatch();
                }
            }
        });
    }
//----------------------------------------------------------------------------------------MATCH
//----------------------------------------------------------------------------------------TOURNAMENT

    async createTournament(user, alias, size, visibility) { 
        LOGGER(200, "UserManager.js", "createTournament", "Called by user alias: " + alias);

        const tournament_id = this.createId();
        const tournament = new Tournament(user.getId(), alias, tournament_id, size, visibility);
    
        // --- Lógica Blockchain ---
        if (this.blockchainEnabled) {
            try {
                const tournamentName = `Tournament ${tournament_id} - ${alias}`;
                const startTime = Math.floor(Date.now() / 1000);
                const endTime = startTime + (7 * 24 * 60 * 60); 
                
                const blockchainId = await blockchainService.createTournament(
                    tournamentName,
                    startTime,
                    endTime
                );
                tournament.blockchainId = blockchainId;
                tournament.blockchainName = tournamentName;
                LOGGER(200, "UserManager", "createTournament", `Created on blockchain with ID: ${blockchainId}`);
            } catch (error) {
                LOGGER(400, "UserManager", "createTournament", "Failed to create on blockchain: " + error.message);
            }
        }
        

        this.tournaments.set(tournament_id, tournament);
        return (tournament);
    }

    addToTournament(user, tournament, alias) { 
        LOGGER(200, "UserManager.js", "addToTournament", "Added user: " + alias);

        if (tournament.addUser(user.getId(), alias) === false) {
            return (false);
        }
        
        user.setTournament(tournament);

/*         if (user.stats) {
            user.stats.tournaments_played = (user.stats.tournaments_played || 0) + 1;
        } */
        
        return (true);
    }

    removeTournament(tournament_id) { LOGGER(200, "UserManager.js", "removeTournament", "deleted tournament id: " + tournament_id);
        this.tournaments.delete(tournament_id);
    }

    async stopTournament(tournament) {

        const winner_id   = tournament.getWinner();
        const winner_user = winner_id ? this.getUserByID(winner_id) : null;

        if (!winner_user) {
            LOGGER(400, "UserManager", "stopTournament", "Winner user not found");
            return;
        }

        // Save all player scores to blockchain before finalizing
        if (this.blockchainEnabled && tournament.blockchainId) {
            try {
                LOGGER(200, "UserManager", "stopTournament", "Saving tournament results to blockchain...");
                console.log("\n" + "=".repeat(70));
                console.log("BLOCKCHAIN TRANSACTION - SAVING TOURNAMENT RESULTS");
                console.log("=".repeat(70));
                console.log(`Tournament: ${tournament.blockchainName}`);
                console.log(`Blockchain ID: ${tournament.blockchainId}`);
                console.log("");
                
                const txHashes = [];
                
                // Record all player scores
                console.log("Recording player scores:");
                for (const [userId, playerData] of tournament.players.entries()) {
                    try {
                        // Convertir userId a dirección Ethereum válida
                        const cleanId = userId.toString().replace(/[^a-f0-9]/gi, '').substring(0, 40);
                        const playerAddress = '0x' + cleanId.padStart(40, '0');
                        const score = tournament.getPlayerScore(userId) || 0;

                        const result = await blockchainService.recordScore(
                            tournament.blockchainId,
                            playerAddress,
                            playerData.alias || 'Unknown',
                            score
                        );
                        console.log(`  ✓ ${playerData.alias}: ${score} pts — TX: ${result.transactionHash}`);
                    } catch (error) {
                        console.log(`  ✗ ${playerData.alias}: Failed - ${error.message}`);
                    }
                }
                console.log("");

                // Finalize tournament on blockchain
                console.log("Finalizing tournament...");
                const finalizeResult = await blockchainService.finalizeTournament(tournament.blockchainId);
                txHashes.push({ type: 'finalize', tx: finalizeResult.transactionHash });
                console.log(`Tournament finalized!`);
                console.log(`    TX: ${finalizeResult.transactionHash}`);
                LOGGER(200, "UserManager", "stopTournament", `Tournament ${tournament.blockchainId} finalized - TX: ${finalizeResult.transactionHash}`);
                console.log("");
                
                // Get and log final results
                const results = await blockchainService.getTournamentResults(tournament.blockchainId);
                console.log("FINAL RANKINGS (verified on blockchain):");
                console.log("-".repeat(70));
                results.rankings.forEach((player, index) => {
                    const medal = index === 0 ? "1. " : index === 1 ? "2. " : index === 2 ? "3. " : "  ";
                    console.log(`${medal} ${index + 1}. ${player.playerName.padEnd(20)} - ${player.score} points`);
                    LOGGER(200, "UserManager", "stopTournament", `${index + 1}. ${player.playerName}: ${player.score} points`);
                });
                console.log("-".repeat(70));
                console.log("");
                
                console.log("BLOCKCHAIN VERIFICATION:");
                console.log(`  Network: Avalanche Fuji Testnet`);
                console.log(`  Contract: ${process.env.CONTRACT_ADDRESS}`);
                console.log(`  View on SnowTrace: https://testnet.snowtrace.io/address/${process.env.CONTRACT_ADDRESS}`);
                console.log("");
                console.log("Transaction Hashes:");
                txHashes.forEach((tx, i) => {
                    if (tx.type === 'score') {
                        console.log(`  ${i + 1}. Score (${tx.player}): https://testnet.snowtrace.io/tx/${tx.tx}`);
                    } else {
                        console.log(`  ${i + 1}. Finalization: https://testnet.snowtrace.io/tx/${tx.tx}`);
                    }
                });
                console.log("=".repeat(70) + "\n");
            } catch (error) {
                console.log(`\n✗ Failed to save to blockchain: ${error.message}\n`);
                LOGGER(400, "UserManager", "stopTournament", "Failed to save to blockchain: " + error.message);
            }
        }
        this.stats.handleTournamentWin(winner_user);

        // Notificar a todos
        let ids = tournament.getPlayers();
        for (const id of ids.keys()) {
            const userX = this.getUserByID(id);
            userX.notify("NOTIFICATION", `${tournament.getPlayerAlias(winner_id)} won the Tournament!`)
        }

        // Limpieza
        //this.removeTournament(tournament.getId());
        winner_user.setTournament(null);
        winner_user.setIsPlaying(false);
    }


    updateTournaments() {
        this.tournaments.forEach(tournament => {

            if (tournament.getCurrentSize() === 0) {
                this.removeTournament(tournament.getId());
                return;
            }

            if (tournament.isWaitingAndFull()) {
                tournament.setReady();
                for (const [userId] of tournament.getPlayers()) {
                    this.incrementTournamentPlayedDB(userId);
                    const playerUser = this.getUserByID(userId);
                    if (playerUser?.stats) {
                        playerUser.stats.tournaments_played = (playerUser.stats.tournaments_played || 0) + 1;
                    }
                }
                this.createNewTournamentMatches(tournament.getPlayers(), tournament);
            }
            else if (tournament.isRoundFinished()) {
                const winners = tournament.prepareNextRound();
                if (winners.size > 1) {
                    this.createNewTournamentMatches(winners, tournament);
                } else {
                  
                    if (tournament._stopping) return;
                    tournament._stopping = true;


                    this.removeTournament(tournament.getId());

                    this.stopTournament(tournament).catch(err => {
                        console.error("stopTournament error:", err.message);
                    });
                }
            }
        });
    }

    createNewTournamentMatches(playerMap, tournament) { LOGGER(200, "UserManager.js", "createNewTournamentMatches", "Called");

        
	    const players = Array.from(playerMap.keys());

	    for (let i = 0; i < players.length; i += 2) {

            const user1Id = players[i];
            const user2Id = players[i + 1];
            const user1 = this.getUserByID(user1Id);
            const user2 = this.getUserByID(user2Id);
	    	const match = this.createMatch(user1, "tournament", tournament, false);

            if (user1)
                this.addToMatch(user1, match);
            if (user2)
                this.addToMatch(user2, match);
  
	    	tournament.matches.set(match.getId(), {user1Id, user2Id});
    

            if (!user2) {
                this.stopMatch(match);
            } 
	    }
    }

//----------------------------------------------------------------------------------------TOURNAMENT

//----------------------------------------------------------------------------------------UTILS
    createId() { 

        const time = Date.now().toString(36).slice(0, 8);
    	const rand = Math.floor(Math.random() * 0xffff).toString(36).slice(0, 8);

    	return (time + rand);
    }

    getUserByID(userId) {
        return this.users.get(userId);
    }

    getUserByUsername(username) {
        for (const user of this.users.values()) {
            if (user.username === username) {
                return user;
            }
        }
        return null;
    }

    getConnectedUsers() {
        const connected = [];
        for (const user of this.users.values()) {
            if (user.isConnected) {
                connected.push(user);
            }
        }
        return connected;
    }

    getConnectedCount() {
        return this.getConnectedUsers().length;
    }

    getAllUsers() {
        return Array.from(this.users.values());
    }

    getMatchById(match_id) {

    	if (!this.matches.has(match_id))
    		return (null);

    	return (this.matches.get(match_id));
    }

    getTournamentById(tournament_id) {

    	if (!this.tournaments.has(tournament_id))
    		return (null);

    	return (this.tournaments.get(tournament_id));
    }
//----------------------------------------------------------------------------------------UTILS

}

module.exports = UserManager;