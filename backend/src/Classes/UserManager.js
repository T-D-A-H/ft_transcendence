const User = require("./User.js");
const Match = require("./Match.js");
const LOGGER = require("../LOGGER.js");
const Tournament = require("./Tournament.js");
const blockchainService = require("../BlockchainService.js");
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

    createMatchRequest(user, matchType, visibility) {

        if (user.getIsConnected() === false) {
            return { status: 400, msg: "You need to log in to be able to play."};
    	}
        if (user.isInGame() === true) {
            return { status: 400, msg: "You are already in a match/tournament." };
        }

        if (matchType !== "ai_easy" && matchType !== "ai_medium" && matchType !== "ai_hard" && matchType !== "2player" && matchType !== "online") {
            return { status: 400, msg: "Unknown match type." };
        }

        const match = this.createMatch(user, matchType, null, visibility);
    	this.addToMatch(user, match);
    	if (matchType === "2player") {
    		this.addToMatch(user, match);
    	}
    	if (matchType === "ai_easy" || matchType === "ai_medium" || matchType === "ai_hard") {
    		this.addToMatch(matchType, match);
    	}
        user.notify("UPDATE", "match", {
            id: match.id,
            type: matchType + " match",
            size: match.size.toString() + "/2",
            creator: match.getCreatorUser().getDisplayName(),
            players: [match.players[0].getDisplayName(), match.getSecondPlayerName()],
            status: (match.size === 2) ? "Ready" : "Waiting..."
        });
        return { status: 200, msg: "Succesfully created match!", match_id: match.id };
    }

    sendMatchInviteRequest(user, targetMatch, targetUsername) {

        if (targetMatch !== user.getCurrentMatch()) {
            return { status: 404, msg: "You are not part of this match." };
        }
        const targetUser = this.getUserByUsername(targetUsername);
    	if (targetUser === null) {
            return { status: 400, msg: `Couldn't find user "${targetUsername}"` };
    	}
    	else if (targetUser.getIsConnected() === false) {
            return { status: 400, msg: targetUsername + " is not online." };
    	}
    	else {

    		targetUser.addPendingRequest("match", targetMatch.getId(), user.getId());
    		targetUser.notify("REQUEST", `${user.getUsername()} sent you an invite request.`, {type: "matches", id: targetMatch.getId()});
            return { status: 200, msg: `Sent invite to play with ${targetUsername}`};
    	}
    }

    respondMatchInviteRequest(user, targetMatch, accept) {

        const targetUser = targetMatch.getCreator();

        if (targetUser === null) {
            return { status: 404, msg: "Couldn't find user in pending requests." };
    	}

        const targetUserName = targetUser.getUsername();
    	if (!user.hasPendingRequest("match", targetMatch.getId(), targetUser.getId())) {
            return { status: 404, msg: "Couldn't find user in pending requests." };
    	}
    	if (accept === false) {
    		targetUser.notify("NOTIFICATION", `${user.getUsername()} declined your invite.`);
    		user.removePendingRequest("match", targetMatch.getId(), targetUser.getId());
            return { status: 404, msg: `You declined ${targetUserName}'s invite.`};
    	}
    	if (targetUser.getIsConnected() === false) {
            user.removePendingRequest("match", targetMatch.getId(), targetUser.getId());
            return { status: 404, msg: `${targetUserName} is not online.`};
    	}
    	if (targetUser.getIsPlaying() === true) {
            return { status: 201, msg: `${targetUserName} is currently in a match. Try again later.`};
    	}
    	this.addToMatch(user, targetMatch);
    	user.removePendingRequest("match", targetMatch.getId(), targetUser.getId());
    	targetUser.notify("NOTIFICATION", `${user.getUsername()} accepted your invite.`);
        targetMatch.broadcast("UPDATE", "match", {
            id: targetMatch.id,
            type: targetMatch.matchType + " match",
            size: targetMatch.size.toString() + "/2",
            creator: targetMatch.getCreatorUser().getDisplayName(),
            players: [targetMatch.players[0].getDisplayName(), targetMatch.players[1].getDisplayName()],
            status: "Ready"
        });
        return {status: 200, msg: `You accepted ${targetUserName}'s invite.`};
    }

    startMatchRequest(user, targetMatch) {

        if (user.getCurrentMatch() === null) {
            return { status: 400, msg: "You are not in a match."};
        }
    	targetMatch.setReady(user);
        return { status: 200, msg: "Succesfully started match."};
    }

    exitMatchRequest(user, targetMatch, targetTournament) {


    	if (user.getCurrentMatch() === null) {
            return { status: 400, msg: "You are not in a match."};
    	}
        if (targetMatch !== user.getCurrentMatch()) {
            return { status: 404, msg: "You are not in this match."};
        }
        this.disconnectUser(user);
        return { status: 200, msg: "Succesfully exited Match."};
    }


    joinTournamentRequest(user, tournament) {

        // 1. Si el usuario ya está en juego
        if (user.isInGame() === true) {
            
            // 🔥 CORRECCIÓN: Si ya está en ESTE torneo, simplemente devolvemos éxito (reconexión)
            if (user.getCurrentTournament() === tournament) {
                return { 
                    status: 200, 
                    msg: `Welcome back to ${tournament.getCreatorAlias()}'s tournament.` 
                };
            }
            return { status: 400, msg: "You are already in a game/tournament." };
        }

        if (tournament.getIfTournamentFull()) {
            return { status: 400, msg: "Tournament already full." };
        }

        const added = this.addToTournament(user, tournament, user.getDisplayName());
        if (!added) {
            return { status: 500, msg: "Could not join tournament." };
        }
        
        tournament.broadcast(this, "NOTIFICATION",`${user.getDisplayName()} joined the tournament. ${tournament.getCurrentSize()}/${tournament.getTournamentSize()}`, null, [user.getId()])
        tournament.broadcast("UPDATE", "tournament", {
            id: tournament.id,
            type: "tournament",
            size: tournament.getCurrentSize().toString() + "/" + tournament.getTournamentSize().toString(),
            creator: tournament.getCreatorAlias(),
            players: [tournament.getPlayers().alias],
            status: (tournament.getCurrentSize() === tournament.getTournamentSize()) ? "Ready" : "Waiting..."
        });
        return { status: 200, msg: `Joined ${tournament.getCreatorAlias()}'s tournament.` };
    }

    sendTournamentInvite(user, targetTournament, targetUsername) {

        if (targetTournament !== user.getCurrentTournament()) {
            return { status: 404, msg: "You are not part of this tournament." };
        }

        const targetUser = this.getUserByUsername(targetUsername);

	    if (targetUser === null) {

            return { status: 400, msg: targetUsername + " is either not online or doesn't exist." };
	    }
	    else if (targetUser.getIsConnected() === false) {

            return { status: 400, msg: targetUsername + " is not online." };
	    }
	    else {

	    	targetUser.addPendingTournamentRequest("tournaments", targetTournament.getId(), user.getId());
            targetUser.notify("REQUEST", `${user.getUsername()} sent you an invite request.`, {type: "tournaments", id: targetTournament.getId()});
            return { status: 200, msg: "Sent invite to " + targetUsername};
	    }
    }

    respondTournamentInvite(user, targetTournament, accept) {

        const creatorId = targetTournament.getCreator();
        const targetUser = this.getUserByID(creatorId);

        if (!targetUser) {
            return { status: 404, msg: "Couldn't find creator." };
        }

        const targetUserName = targetUser.getUsername();

        if (!user.hasPendingRequest("tournaments", targetTournament.getId(), targetUser.getId())) {
            return { status: 404, msg: "Couldn't find request in pending list." };
        }

        if (accept === false) {
            targetUser.notify("NOTIFICATION", `${user.getUsername()} declined your invite.`);
            user.removePendingRequest("tournaments", targetTournament.getId(), targetUser.getId());
            return { status: 404, msg: `You declined ${targetUserName}'s invite.` };
        }
        if (!targetUser.getIsConnected()) {
            user.removePendingRequest("tournaments", targetTournament.getId(), targetUser.getId());
            return { status: 404, msg: `${targetUserName} is not online.` };
        }
        if (targetUser.getIsPlaying()) {
            return { status: 201, msg: `${targetUserName} is currently in a match. Try again later.` };
        }

        this.addToTournament(user, targetTournament, user.getDisplayName());
        user.removePendingRequest("tournaments", targetTournament.getId(), targetUser.getId());
        targetUser.notify("NOTIFICATION", `${user.getUsername()} accepted your invite.`);

        targetTournament.broadcast(this, "UPDATE", "tournament", {
            id: targetTournament.id,
            type: "tournament",
            size: targetTournament.getCurrentSize().toString() + "/" + targetTournament.getTournamentSize().toString(),
            creator: targetTournament.getCreatorAlias(),
            players: [targetTournament.getPlayers().alias],
            status: (targetTournament.getCurrentSize() === targetTournament.getTournamentSize()) ? "Ready" : "Waiting..."
        });

        return { status: 200, msg: `You accepted ${targetUserName}'s invite.` };
    }

    searchTournamentsRequest() {

        const available_tournaments = [];

    	for (const tournament of this.tournaments.values()) {

            if (tournament.isPublicTournament()) {
                available_tournaments.push({
    			    id: tournament.getTournamentId(),
    			    creator: tournament.getCreatorAlias(),
    			    max_size: tournament.getTournamentSize(),
    			    current_size: tournament.getCurrentSize(),
                    full: tournament.isWaitingAndFull()
    		    });
            }

    	}
        if (available_tournaments === null)
            return { status: 400, msg: "Found No tournaments.", target: null };
    	return { status: 200, msg: "Found tournaments.", target: available_tournaments };
    }

    searchMatchesRequest() {

        const available_matches = [];

    	for (const match of this.matches.values()) {

            if (match.isPublicMatch() && match.STARTED === false) {
    		    available_matches.push({
    		    	id: match.getId(),
    		    	creator: match.getCreator().getDisplayName(),
    		    	max_size: 2,
    		    	current_size: 1
    		    });
            }

    	}
    	return { status: 200, msg: "Found Matches.", target: available_matches };
    }

    searchFriendsRequest() { // FAKE CAMBIAR

        const available_friends = [];

    	for (const friend of this.users.values()) {


            available_friends.push({
    		    id: friend.getId(),
    		    username: friend.getUsername(),
    		    display_name: friend.getDisplayName()
    		});

    	}
    	return { status: 200, msg: "Found friends.", target: available_friends };
    }


    getRequests(requestingUser, filter) {

	    const request_list = requestingUser.getPendingRequests();

	    if (request_list.length === 0) {

            return { status: 400, msg: "You have no pending requests."};
	    }
        const list = [];

	    for (const req of request_list.values()) {
            if (filter && req.type !== filter)
                continue ;
            const targetUser = this.getUserByID(req.user);

	    	list.push({
	    		type: req.type,
	    		id: req.id,
	    		display_name: targetUser.getDisplayName(),
	    		username: targetUser.getUsername()
	    	});
	    }
        return { status: 200, msg: "Pending request list updated.", target: list};
    }

    formatPercent(value) {
        if (!Number.isFinite(value)) return "0%";
            return `${Math.round(value)}%`;
    }
    
    // -- BETTER STATS INFO -- //
    userInfo(targetUser) {
        const s = targetUser.stats;

        let winRate_temp = s.matches > 0 ? (s.total_wins/ s.matches) * 100 : 0;
        if (!Number.isFinite(winRate_temp))
            winRate_temp = "0%";
        else
            winRate_temp = `${Math.round(winRate_temp)}%`;
        
        s.win_rate = winRate_temp;
        return {
            status: 200, 
            msg: "Succesfully fetched user info.", 
            target: {
                display_name: targetUser.getDisplayName(),
                username: targetUser.getUsername(),
                user_id: targetUser.getId(),
                avatar: targetUser.getAvatar(),
                stats: {
                    local_played: s.local_played,
                    local_won: s.local_won,
                    online_played: s.online_played,
                    online_won: s.online_won,
                    tournaments_played: s.tournaments_played,
                    tournaments_won: s.tournaments_won,
                    ai_played: s.ai_played,
                    ai_won: s.ai_won,
                    totalGames: s.matches, 
                    totalWins: s.total_wins,
                    currentWinStreak: s.current_streak,
                    bestWinStreak: s.best_streak,
                    winRate: s.win_rate 
                }
            }
        };
    }


    async getMatchHistoryFromDB(userId) {
        return new Promise((resolve, reject) => {
            if (!this.db) return resolve([]);
            
            const query = `
                SELECT m.id, m.score_p1, m.score_p2, m.winner_id, m.game_mode, m.played_at, m.player1_id,
                       u1.display_name as p1_name, u2.display_name as p2_name
                FROM matches m
                LEFT JOIN users u1 ON m.player1_id = u1.id
                LEFT JOIN users u2 ON m.player2_id = u2.id
                WHERE m.player1_id = ? OR m.player2_id = ?
                ORDER BY m.played_at DESC LIMIT 20
            `;
            
            this.db.all(query, [userId, userId], (err, rows) => {
                if (err) return reject(err);
                
                const history = rows.map(row => {
                    const isP1 = (row.player1_id === userId);
                    let result = "loss";
                    
                    if (row.winner_id === userId) result = "win";
                    else if (row.game_mode === "local" && isP1 && row.score_p1 > row.score_p2) result = "win";

                    let opponent = "Unknown";
                    if (isP1) {
                         if (row.p2_name) opponent = row.p2_name;
                         else if (row.game_mode === "local") opponent = "Guest";
                         else if (row.game_mode.includes("ai")) opponent = "AI";
                    } else {
                        opponent = row.p1_name || "Unknown";
                    }

                    return {
                        id: row.id,
                        result: result,
                        opponent: opponent,
                        userScore: isP1 ? row.score_p1 : row.score_p2,
                        opponentScore: isP1 ? row.score_p2 : row.score_p1,
                        mode: row.game_mode,
                        timestamp: new Date(row.played_at).getTime()
                    };
                });
                resolve(history);
            });
        });
    }

//----------------------------------------------------------------------------------------API CALLS

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
        else if (resultType === "ai") {
            query = `UPDATE stats SET ai_played = ai_played + 1, matches = matches + 1 ${isWin ? ", ai_won = ai_won + 1" : ""} WHERE user_id = ?`;
        }

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

            const loserIndex = match.players.indexOf(user);
            const winnerIndex = 1 - loserIndex;
            const loserAlias = (tournament) ? tournament.getPlayerAlias(user.getId()) : user.getDisplayName();

            match.players[winnerIndex].notify("NOTIFICATION", `${loserAlias} disconnected.`);
            match.setWINNER(winnerIndex);
            match.setLOSER(loserIndex);
            this.stopMatch(match);
        }
        if (tournament) {

            if (tournament.getWinners().has(userId)) {

                tournament.deleteWinner(userId);
            }
            if (tournament.getCreator() === userId) {

                tournament.creator = null;
                if (tournament.getIsWaiting() === true && tournament.getCurrentSize() === 1) {

                    this.removeTournament(tournament.getId());
                }

            }
            tournament.removePlayer(userId);
        }
        user.setTournament(null);
        user.setConnected(false);
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
                type: match.getType(),
                tournament_id: tournament.getId(),
                match_id: match.getId(),
                self_displayname: tournament.getPlayerAlias(user1.getId()), 
                opponent_display_name: tournament.getPlayerAlias(user2.getId()),
                
            });
            user2.notify("GAME_READY", "Game Starting", {
                type: match.getType(),
                tournament_id: tournament.getId(),
                match_id: match.getId(),
                self_displayname: tournament.getPlayerAlias(user2.getId()), 
                opponent_display_name: tournament.getPlayerAlias(user1.getId()), 
            });
        }
        else {

            user1.notify("GAME_READY", "Game Starting", {
                type: match.getType(),
                match_id: match.getId(),
                id: user2.getId(), 
                display_name: user2.getDisplayName(), 
                username: user2.getUsername()
                
            });
            user2.notify("GAME_READY", "Game Starting", {
                type: match.getType(),
                match_id: match.getId(),
                id: user1.getId(), 
                display_name: user1.getDisplayName(), 
                username: user1.getUsername(), 
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
            const w_id = winnerUser.getId();

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

        } else if (matchType.startsWith("ai")) {
            // IA
            const user = players[0];
            if (user) {
                const userWon = this.stats._handleAI(user, scores);
                user.notify("WIN", userWon ? "You beat the AI!" : "The AI defeated you.");
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
            tournament.broadcast(
                this,
                "NOTIFICATION",
                `${winnerUser.getDisplayName()} won round against ${loserUser.getDisplayName()}`,
                null,
                [winnerUser.getId(), loserUser.getId()]
            );
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
    async createTournamentRequest(user, tournamentSize, visibility) {
        const size = Number(tournamentSize);

        // Validaciones
        if (user.isInGame() === true) {
            return { status: 400, msg: "You are already in a game/tournament." };
        }
        if (size < 2 || size > 64 || size % 2 !== 0) {
            return { status: 400, msg: "Tournament sizes should be even numbers (2-64)." };
        }

        try {
            // 1. Crear el torneo
            const tournament = await this.createTournament(user, user.getDisplayName(), size, visibility);

            // 2. Añadir al creador
            this.addToTournament(user, tournament, user.getDisplayName());

            // 3. Notificar
            user.notify("UPDATE", "tournament", {
                id: tournament.getId(),
                type: "tournament",
                size: tournament.getCurrentSize().toString() + "/" + tournament.getTournamentSize().toString(),
                creator: tournament.getCreatorAlias(),
                players: [tournament.getPlayers().alias], 
                status: "Waiting..."
            });

            return { 
                status: 200, 
                msg: "Tournament created!", 
                tournament_id: tournament.getId() 
            };

        } catch (err) {
            console.error(err);
            return { status: 500, msg: "Internal Server Error creating tournament." };
        }
    }

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
        
        this.incrementTournamentPlayedDB(user.getId());
        
        user.setTournament(tournament);

        if (user.stats) {
            user.stats.tournaments_played = (user.stats.tournaments_played || 0) + 1;
        }
        
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
            this.removeTournament(tournament.getId());
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
                for (const [user, playerData] of tournament.players.entries()) {
                    try {
                        // Convert user ID to valid Fuji Testnet address
                        const userId = user.id.toString().replace(/[^a-f0-9]/gi, '').substring(0, 40);
                        const playerAddress = '0x' + userId.padStart(40, '0');
                        const score = tournament.getPlayerScore(user) || 0;
                        
                        const result = await blockchainService.recordScore(
                            tournament.blockchainId,
                            playerAddress,
                            playerData.alias,
                            score
                        );
                        txHashes.push({ type: 'score', player: playerData.alias, tx: result.transactionHash });
                        console.log(`${playerData.alias}: ${score} points`);
                        console.log(`    TX: ${result.transactionHash}`);
                        LOGGER(200, "UserManager", "stopTournament", `Recorded score for ${playerData.alias}: ${score} - TX: ${result.transactionHash}`);
                    } catch (error) {
                        console.log(`✗ ${playerData.alias}: Failed - ${error.message}`);
                        LOGGER(400, "UserManager", "stopTournament", `Failed to record score for ${playerData.alias}: ${error.message}`);
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
        tournament.broadcast(
            this,
            "NOTIFICATION",
            `${tournament.getPlayerAlias(winner_id)} won the Tournament!`
        );

        // Limpieza
        this.removeTournament(tournament.getId());
        winner_user.setTournament(null);
        winner_user.setIsPlaying(false);
    }

    updateTournaments() {

    	this.tournaments.forEach(tournament => {


            if (tournament.getCurrentSize() === 0) {
                this.removeTournament(tournament.getId());
            }
    		if (tournament.isWaitingAndFull()) { LOGGER(200, "UserManager.js", "updateTournaments", "Tournament is waiting and full");

                tournament.setReady();
    			this.createNewTournamentMatches(tournament.getPlayers(), tournament);
    		}
    		else if (tournament.isRoundFinished()) {

    			const winners = tournament.prepareNextRound();
    			if (winners.size > 1) {
    				this.createNewTournamentMatches(winners, tournament);
                }
                else {
                    this.stopTournament(tournament);
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
            } else {
            // FIX: notificar directamente en vez de esperar el game loop
            match.players[0].setIsPlaying(true);
            match.players[1].setIsPlaying(true);
            match.setWaiting(false);  // ← marcar como no-waiting para que updateMatches no lo reenvíe
            this.sendGameReady(match);
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