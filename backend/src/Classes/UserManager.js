const User = require("./User.js");
const Match = require("./Match.js");
const LOGGER = require("../LOGGER.js");
const Tournament = require("./Tournament.js");
// AÑADIDO: Importamos el servicio de Blockchain
const blockchainService = require("../BlockchainService.js");

class UserManager {

    constructor(db) {
        LOGGER(200, "UserManager", "Constructor", "Called");
        this.db = db;
        this.users = new Map();
        this.matches = new Map();
        this.tournaments = new Map();
        this.pending2FA = new Map();
        
        this.userStats = new Map();
        this.matchHistory = new Map();
        
        // AÑADIDO: Flags de estado para Blockchain
        this.blockchainEnabled = false;
        this.blockchainInitialized = false;
    }

    //----------------------------------------------------------------------------------------API CALLS

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

    createTournamentRequest(user, tournamentSize, visibility) {

    	const size = Number(tournamentSize);

    	if (user.isInGame() === true) {
    		return { status: 400, msg: "You are already in a game/tournament." };
    	}
    	if (size < 2 || size > 64 || size % 2 !== 0) {
    		return { status: 400, msg: "Tournament sizes should be even numbers (2-64)." };
    	}
    	const tournament = this.createTournament(user, user.getDisplayName(), size, visibility);
    	this.addToTournament(user, tournament, user.getDisplayName());
        user.notify("UPDATE", "tournament", {
            id: tournament.id,
            type: "tournament",
            size: tournament.getCurrentSize().toString() + "/" + tournament.getTournamentSize().toString(),
            creator: tournament.getCreatorAlias(),
            players: [tournament.getPlayers().alias],
            status: "Waiting..."
        });
    	return { status: 200, msg: "Tournament created!", tournament_id:  tournament.getId()};
    }

    joinTournamentRequest(user, tournament) {


    	if (user.isInGame() === false) {
    		if (user.getCurrentTournament() === tournament)
    			return { status: 400, msg: "You are already in this tournament." };
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

        const targetUser = targetTournament.getCreator();

        if (targetUser === null) {

            return { status: 404, msg: "Couldn't find user in pending requests." };
	    }
        const targetUserName = targetUser.getUsername();
	    if (!targetUser.hasPendingRequest("tournament", targetTournament.getId(), targetUser.getId())) {

            return { status: 404, msg: "Couldn't find user in pending requests." };
	    }
	    if (accept === false) {
            targetUser.notify("NOTIFICATION", `${user.getUsername()} declined your invite.`);
	    	user.removePendingRequest("tournament", targetTournament.getId(), targetUser.getId());
            return { status: 404, msg: `You declined ${targetUserName}'s invite.`};
	    }
	    if (targetUser.getIsConnected() === false) {

            user.removePendingRequest("tournament", targetTournament.getId(), targetUser.getId());
             return { status: 404, msg: `${targetUserName} is not online.`};
	    }
	    if (targetUser.getIsPlaying() === true) {

            return { status: 201, msg: targetUserName + " is currently in a match. Try again later."};
	    }
	    this.addToTournament(user, targetTournament, user.getDisplayName());
	    user.removePendingRequest("tournament", targetTournament.getId(), targetUser.getId());
        targetUser.notify("NOTIFICATION", `${user.getUsername()} accepted your invite.`);
        targetTournament.broadcast("UPDATE", "tournament", {
            id: targetTournament.id,
            type: "tournament",
            size: targetTournament.getCurrentSize().toString() + "/" + targetTournament.getTournamentSize().toString(),
            creator: targetTournament.getCreatorAlias(),
            players: [targetTournament.getPlayers().alias],
            status: (targetTournament.getCurrentSize() === targetTournament.getTournamentSize()) ? "Ready" : "Waiting..."
        });
        return {status: 200, msg: `You accepted ${targetUserName}'s invite.`}
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

	    if (request_list.size === 0) {

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

    userInfo(targetUser) {

        return { 
            status: 200, 
            msg: "Succesfully fetched user info.", 
            target: {
                display_name: targetUser.getDisplayName(),
	    	    username: targetUser.getUsername(),
                user_id: targetUser.getId()
            }
        };
    }

    userStats(targetUser) {

        return { 
            status: 200, 
            msg: "Succesfully fetched user stats.", 
            target: {
                matches_total: 123,
    		    matches_win: 33,
                tournament_total: 67,
                tournament_win: 32
            }
        };
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

    saveGameStatsToDB(winnerId, loserId, type) {
        if (!this.db) return;

        let updateQuery = "";

        if (type === "online") {
            const updateWinner = "UPDATE users SET online_played = online_played + 1, online_won = online_won + 1 WHERE id = ?";
            const updateLoser = "UPDATE users SET online_played = online_played + 1 WHERE id = ?";
            this.db.run(updateWinner, [winnerId], (err) => { if(err) console.error(err) });
            this.db.run(updateLoser, [loserId], (err) => { if(err) console.error(err) });
            return;
        }
        else if (type === "local_win") {
            updateQuery = "UPDATE users SET local_played = local_played + 1, local_won = local_won + 1 WHERE id = ?";
        }
        else if (type === "local_played") {
            updateQuery = "UPDATE users SET local_played = local_played + 1 WHERE id = ?";
        }
        else if (type === "tournament_win") {
            updateQuery = "UPDATE users SET tournaments_played = tournaments_played + 1, tournaments_won = tournaments_won + 1 WHERE id = ?";
        }
        else if (type === "tournament_played") {
            updateQuery = "UPDATE users SET tournaments_played = tournaments_played + 1 WHERE id = ?";
        }
        if (updateQuery) {
            this.db.run(updateQuery, [winnerId], (err) => { 
                if (err) console.error("Error saving stats:", err); 
            });
        }
    }
    
    incrementTournamentPlayedDB(userId) {
        if (!this.db) return;
        this.db.run("UPDATE users SET tournaments_played = tournaments_played + 1 WHERE id = ?", [userId], (err) => {
            if (err) console.error("Error updating tournaments_played:", err);
        });
    }

    isUserConnected(userId) {
        return this.users.has(userId);
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

    sendMirror(match) { LOGGER(200, "UserManager.js", "sendMirror", "Sent to match: " + match.id);

		match.players.forEach(user => {
            
            if (user.getDisplaySide() === match.getPlayerSides(user)) {
                user.notify("MIRROR", null, null);
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

    stopMatch(match) { LOGGER(200, "UserManager.js", "stopMatch", "called");

        this.recordMatchResult(match);
        const tournament  = match.getTournament();
        const winnerUser  = match.getWinner();
        const loserUser   = match.getLoser();
        const winnerAlias = winnerUser.getDisplayName();
        const loserAlias  = loserUser.getDisplayName();
        const players = match.getPlayers();
        const scores = match.getScores();

        // 2. Guardar HISTORIAL en Base de Datos (SIEMPRE)
        if (this.db && players && players[0] && scores && winnerUser) {
            const player1Id = players[1].getId();
            const player2Id = match.getIsLocal() ? null : (players[0] ? players[0].getId() : null);

            
            let winnerIdForDB = winnerUser.getId();
            if (match.getIsLocal() && scores[0] > scores[1]) {
                winnerIdForDB = null;
            }

            this.db.run(
                `INSERT INTO matches (player1_id, player2_id, score_p1, score_p2, winner_id, game_mode, is_ai_match)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    player1Id, player2Id, scores[1], scores[0], winnerIdForDB,
                    tournament ? "TOURNAMENT" : "CLASSIC",
                    0 // is_ai_match=0 (Las partidas gestionadas aquí son entre humanos)
                ],
                (err) => { if (err) console.error("Error inserting match history:", err); }
            );
        }
        if (tournament !== null) {

            tournament.updateWinner(match.getId(), winnerUser.getId());
            tournament.broadcast(this, "NOTIFICATION", `${winnerAlias} won tournament game against ${loserAlias}`, null, [winnerUser.getId(), loserUser.getId()]);

            if (loserUser) {
                loserUser.tournaments_played = (loserUser.tournaments_played || 0) + 1;
                this.saveGameStatsToDB(loserUser.id, null, "tournament_played");
                tournament.sendLose(loserUser, winner)
                loserUser.unsetTournament();
            }
        }
        winnerUser.notify("WIN", `You won the game against ${loserAlias}`);
		loserUser.notify("WIN", `You lost the game against ${winnerAlias}`);
        if (winnerUser && loserUser) {
            if (match.getMatchType() === "2player") {
                const loggedUser = match.players[0];
                loggedUser.local_played = (loggedUser.local_played || 0) + 1;
                if (match.SCORES[1] >= match.SCORES[0]) {
                    loggedUser.local_won = (loggedUser.local_won || 0) + 1;
                    this.saveGameStatsToDB(loggedUser.id, null, "local_win");
                }
                else {
                    this.saveGameStatsToDB(loggedUser.id, null, "local_played");
                }
            }
            else {
                this.saveGameStatsToDB(winnerUser.id, loserUser.id, "online");
            }
        }
        if (match.players[0] !== null) {
            match.players[0].setMatch(null);
            match.players[0].setIsPlaying(false);
        }
        if (match.players[1] !== null) {
            match.players[1].setMatch(null);
            match.players[1].setIsPlaying(false);
        }
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

    async createTournament(user, alias, size, visibility) { LOGGER(200, "UserManager.js", "createTournament", "Called by user alias: " + alias);

        const tournament_id = this.createId();
		const tournament = new Tournament(user.getId(), alias, tournament_id, size, visibility);
    
        // --- AÑADIDO: Lógica de creación en Blockchain ---
        if (this.blockchainEnabled) {
            try {
                const tournamentName = `Tournament ${tournament_id} - ${alias}`;
                const startTime = Math.floor(Date.now() / 1000);
                const endTime = startTime + (7 * 24 * 60 * 60); // 7 days duration
                
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
        this.incrementTournamentPlayedDB(user.getId());
        tournament.addUserToTournament(user, alias);
        const stats = this.ensureUserStats(user);
        if (stats) stats.tournamentsPlayed += 1;
        // -----------------------------------------------
        this.tournaments.set(tournament_id, tournament);
        return (tournament);
    }

    addToTournament(user, tournament, alias) { LOGGER(200, "UserManager.js", "addToTournament", "Added user: " + alias);

        if (tournament.addUser(user.getId(), alias) === false) {
            return (false);
        }
        // Sumar tournament_played en DB al unirse
        this.incrementTournamentPlayedDB(user.getId());
        user.setTournament(tournament);
        const stats = this.ensureUserStats(user);
        if (stats) stats.tournamentsPlayed += 1;
        return (true);
    }

    removeTournament(tournament_id) { LOGGER(200, "UserManager.js", "removeTournament", "deleted tournament id: " + tournament_id);
        this.tournaments.delete(tournament_id);
    }

    async stopTournament(tournament) { LOGGER(200, "UserManager.js", "stopTournament", "called");

        const winner_user = this.getUserByID(tournament.getWinner());

        if (winner_user === null) return;
        // --- AÑADIDO: Lógica para guardar scores y finalizar en Blockchain ---
        if (this.blockchainEnabled && tournament.blockchainId && winner_user !== null) {
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
                        // Convert user ID to valid Fuji Testnet address (relleno con ceros)
                        const userId = user.id.toString().replace(/[^a-f0-9]/gi, '').substring(0, 40);
                        const playerAddress = '0x' + userId.padStart(40, '0');
                        // Aseguramos que getPlayerScore exista, si no 0
                        const score = (typeof tournament.getPlayerScore === 'function') ? tournament.getPlayerScore(user) : 0;
                        
                        const result = await blockchainService.recordScore(
                            tournament.blockchainId,
                            playerAddress,
                            playerData.alias,
                            score
                        );
                        txHashes.push({ type: 'score', player: playerData.alias, tx: result.transactionHash });
                        console.log(`${playerData.alias}: ${score} points - TX: ${result.transactionHash}`);
                        LOGGER(200, "UserManager", "stopTournament", `Recorded score for ${playerData.alias}: ${score}`);
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
                console.log(`Tournament finalized! TX: ${finalizeResult.transactionHash}`);
                LOGGER(200, "UserManager", "stopTournament", `Tournament ${tournament.blockchainId} finalized`);
                console.log("");
                
                // Get and log final results (verificación)
                const results = await blockchainService.getTournamentResults(tournament.blockchainId);
                console.log("FINAL RANKINGS (verified on blockchain):");
                results.rankings.forEach((player, index) => {
                    const medal = index === 0 ? "1. " : index === 1 ? "2. " : index === 2 ? "3. " : "  ";
                    console.log(`${medal} ${index + 1}. ${player.playerName.padEnd(20)} - ${player.score} points`);
                });
                console.log("=".repeat(70) + "\n");
            } catch (error) {
                console.log(`\n✗ Failed to save to blockchain: ${error.message}\n`);
                LOGGER(400, "UserManager", "stopTournament", "Failed to save to blockchain: " + error.message);
            }
        }
        // ---------------------------------------------------------------------
        console.log("WINNER USER = " + winner_user.getUsername());
        
        winner_user.tournaments_played = (winner_user.tournaments_played || 0) + 1;
        winner_user.tournaments_won = (winner_user.tournaments_won || 0) + 1;
        this.saveGameStatsToDB(winner_user.id, null, "tournament_win");
        this.removeTournament(tournament.getId());
        tournament.broadcast(this, "NOTIFICATION", `${tournament.getPlayerAlias(tournament.getWinner())} won the Tournament.`, null, null);
        LOGGER(200, "UserManager.js", "updateTournaments", "User: " + tournament.getPlayerAlias(tournament.getWinner()) + " won the Tournament!");
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
            }
	    }
    }

//----------------------------------------------------------------------------------------TOURNAMENT
//----------------------------------------------------------------------------------------STATS

    ensureUserStats(user) {
        if (!user) return null;
        const userId = user.getId();
        if (!this.userStats.has(userId)) {
            this.userStats.set(userId, {
                userId,
                username: user.getUsername(),
                displayName: user.getDisplayName(),
                totalGames: 0, totalWins: 0, totalLosses: 0,
                localGames: 0, localWins: 0, localLosses: 0,
                onlineGames: 0, onlineWins: 0, onlineLosses: 0,
                tournamentGames: 0, tournamentWins: 0, tournamentLosses: 0,
                tournamentsPlayed: 0, tournamentsWon: 0,
                pointsFor: 0, pointsAgainst: 0,
                currentWinStreak: 0, bestWinStreak: 0, lastMatchAt: null,
            });
        }
        return this.userStats.get(userId);
    }

    ensureMatchHistory(user) {
        if (!user) return null;
        const userId = user.getId();
        if (!this.matchHistory.has(userId)) {
            this.matchHistory.set(userId, []);
        }
        return this.matchHistory.get(userId);
    }

    applyMatchResult(stats, result, mode, userScore, opponentScore, endTime) {
        stats.totalGames += 1;
        stats.pointsFor += userScore;
        stats.pointsAgainst += opponentScore;
        if (result === "win") {
            stats.totalWins += 1;
            stats.currentWinStreak += 1;
        } else {
            stats.totalLosses += 1;
            stats.currentWinStreak = 0;
        }
        stats.bestWinStreak = Math.max(stats.bestWinStreak, stats.currentWinStreak);
        stats.lastMatchAt = endTime;

        if (mode === "local") {
            stats.localGames += 1;
            if (result === "win") stats.localWins += 1; else stats.localLosses += 1;
        } else if (mode === "online") {
            stats.onlineGames += 1;
            if (result === "win") stats.onlineWins += 1; else stats.onlineLosses += 1;
        } else { 
            stats.tournamentGames += 1;
            if (result === "win") stats.tournamentWins += 1; else stats.tournamentLosses += 1;
        }
    }

    recordMatchResult(match) {
        if (!match) return;
        const winner = match.getWinner();
        const players = match.getPlayers();
        const scores = match.getScores();
        if (!scores) return;

        match.setEndTime();
        const tournament = match.getTournament();
        const mode = tournament ? "tournament" : (match.getIsLocal() ? "local" : "online");
        const endTime = match.getEndTime() || Date.now();
        const startTime = match.getStartTime() || endTime;
        const durationMs = Math.max(0, endTime - startTime);

        if (match.getIsLocal() && players[0] && players[0] === players[1]) {
            const user = players[0];
            const stats = this.ensureUserStats(user);
            const history = this.ensureMatchHistory(user);
            if (!stats || !history) return;
            
            const userScore = scores[0];
            const opponentScore = scores[1];
            const result = userScore > opponentScore ? "win" : "loss"; // > para evitar empates como victorias
            
            this.applyMatchResult(stats, result, mode, userScore, opponentScore, endTime);
            history.unshift({
                id: match.getMatchId(), timestamp: endTime, durationMs, mode,
                opponent: "Local (self)", userScore, opponentScore, result,
                tournamentId: tournament ? tournament.getTournamentId() : null,
            });
            if (history.length > 50) history.pop();
            return;
        }

        if (!players[0] || !players[1]) return;

        players.forEach((user, index) => {
            if (!user) return;
            const opponent = players[index === 0 ? 1 : 0];
            if (!opponent) return;
            
            const stats = this.ensureUserStats(user);
            const history = this.ensureMatchHistory(user);
            if (!stats || !history) return;
            
            const userScore = scores[index];
            const opponentScore = scores[index === 0 ? 1 : 0];
            const result = user === winner ? "win" : "loss";
            
            this.applyMatchResult(stats, result, mode, userScore, opponentScore, endTime);
            history.unshift({
                id: match.getMatchId(), timestamp: endTime, durationMs, mode,
                opponent: opponent.getDisplayName(), userScore, opponentScore, result,
                tournamentId: tournament ? tournament.getTournamentId() : null,
            });
            if (history.length > 50) history.pop();
        });
    }

    getUserStats(user) { return this.ensureUserStats(user); }

    getMatchHistory(user, limit = 20) {
        const history = this.ensureMatchHistory(user);
        if (!history) return [];
        return history.slice(0, limit);
    }

//----------------------------------------------------------------------------------------STATS
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