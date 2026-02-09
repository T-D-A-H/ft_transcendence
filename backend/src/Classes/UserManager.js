const User = require("./User.js");
const Match = require("./Match.js");
const LOGGER = require("../LOGGER.js");
const Tournament = require("./Tournament.js");

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
        if (user) {
            LOGGER(200, "UserManager", "logoutUser", user.getUsername());
            user.setConnected(false);
            const match = user.getCurrentMatch();
            if (match) this.matchDisconnect(match);

            const tournament = user.getCurrentTournament();
            if (tournament) {
                this.tournamentDisconnect(tournament);
                tournament.removeUserFromTournament(user);
            }
            return true;
        }
        LOGGER(400, "UserManager", "logoutUser", userId + "already logged out.");
        return false;
    }

    removeUser(userId) {
        LOGGER(200, "UserManager", "removeUser", this.users.get(userId));
        const removed = this.users.delete(userId);
        return (removed);
    }

    getUserByID(userId) { return this.users.get(userId); }

    getUserByUsername(username) {
        for (const user of this.users.values()) {
            if (user.username === username) return user;
        }
        return null;
    }

    getConnectedUsers() {
        const connected = [];
        for (const user of this.users.values()) {
            if (user.isConnected) connected.push(user);
        }
        return connected;
    }

    getConnectedCount() { return this.getConnectedUsers().length; }

    getAllUsers() { return Array.from(this.users.values()); }

    // ----------------------------------------------------------------------------------------
    // MEMORY STATS
    // ----------------------------------------------------------------------------------------

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

    // ----------------------------------------------------------------------------------------

    tournamentDisconnect(tournament) {
        LOGGER(200, "UserManager", "tournamentDisconnect", "user disconnected from tournament");
        const winners = tournament.getWinners();
        if (winners === null) return;
        for (const user of winners.keys()) {
            if (user.isConnected === false) {
                tournament.deleteWinner(user);
            }
        }
    }

    matchDisconnect(match) {
        if (match.players[0].isConnected === false) {
            LOGGER(400, "UserManager", "checkMatchDisconnect", "player disconnected");
            match.setWINNER(1);
            match.setLOSER(0);
            match.setDisconnect();
        }
        else if (match.players[1].isConnected === false) {
            match.setWINNER(0);
            match.setLOSER(1);
            match.setDisconnect();
            LOGGER(400, "UserManager", "checkMatchDisconnect", "player disconnected");
        }
    }

//----------------------------------------------------------------------------------------MATCH

    createMatch(user, locally, tournament) { 
        LOGGER(200, "UserManager", "createMatch", user.getUsername());
        const match_id = this.createId();
        const match = new Match(user, match_id, locally, tournament);
        this.matches.set(match_id, match);
        user.setMatch(match);
        return (match);
    }

    addToMatch(requestingUser, match) {
        match.getPlayers()[0].setIsPlaying();
        requestingUser.setIsPlaying();
        match.addUserToMatch(requestingUser);
        requestingUser.setMatch(match);
    }

    removeMatch(match) {
        LOGGER(200, "UserManager", "removeMatch", match.id);
        this.matches.delete(match.id);
    }

    unsetMatches(match) {
        if (!match) return;
        if (match.players[0] !== null) {
            match.players[0].unsetMatch();
            match.players[0].unsetIsPlaying();
        }
        if (match.players[1] !== null) {
            match.players[1].unsetMatch();
            match.players[1].unsetIsPlaying();
        }
    }

    stopMatch(match) {
        LOGGER(200, "UserManager", "stopMatch", "called");
        
        this.recordMatchResult(match);

        const tournament = match.getTournament();
        const winner = match.getWinner();
        const loser = match.getLoser();
        const players = match.getPlayers();
        const scores = match.getScores();

        // 2. Guardar HISTORIAL en Base de Datos (SIEMPRE)
        if (this.db && players && players[0] && scores && winner) {
            const player1Id = players[1].getId();
            const player2Id = match.getIsLocal() ? null : (players[0] ? players[0].getId() : null);

            
            let winnerIdForDB = winner.getId();
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

        // 3. Gestión de Flujo y Stats Numéricas (users table)
        if (tournament !== null) {
            LOGGER(200, "UserManager", "stopMatch", "Is part of tournament");
            const winner = match.getWinner();
            const loser = match.getLoser();
            tournament.updateWinner(match, winner);
            tournament.sendWin(winner, loser);

            if (loser) {
                loser.tournaments_played = (loser.tournaments_played || 0) + 1;
                this.saveGameStatsToDB(loser.id, null, "tournament_played");
                tournament.sendLose(loser, winner)
                loser.unsetTournament();
            }
        }
        else {
            match.sendWin(match.getWinner());
            if (winner && loser) {
                if (match.locally === true) {
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
                    this.saveGameStatsToDB(winner.id, loser.id, "online");
                }
            }
        }
        
        this.sendDisplaySide(match);
        this.unsetMatches(match);
        this.removeMatch(match);
    }

    updateMatches() {
        this.matches.forEach(match => {
            if (match.START === false && match.readyToStart() === true) {
                LOGGER(200, "UserManager.js", "updateMatches", "sent match ready");
                match.sendMatchReady();
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

    sendDisplaySide(match) {
        match.players.forEach(user => {
            const defaultSide = user.getDisplaySide();
            user.socket.send(JSON.stringify({ type: "MIRROR", msg: defaultSide }));
        });
    }

//----------------------------------------------------------------------------------------TOURNAMENT  

    createTournament(user, alias, size) { 
        LOGGER(200, "UserManager", "createTournament", "Called by user alias: " + alias);
        const tournament_id = this.createId();
        const tournament = new Tournament(user, alias, tournament_id, size);
        
        // Sumar tournament_played en DB al crear
        this.incrementTournamentPlayedDB(user.getId());
        
        tournament.addUserToTournament(user, alias);
        this.tournaments.set(tournament_id, tournament);
        user.setTournament(tournament);
        
        const stats = this.ensureUserStats(user);
        if (stats) stats.tournamentsPlayed += 1;

        return (tournament);
    }

    addToTournament(user, tournament, alias = null) {
        const user_alias = (alias === null) ? "Anonymous" : alias;
        if (tournament.addUserToTournament(user, user_alias) === false) {
            return (false);
        }
        
        // Sumar tournament_played en DB al unirse
        this.incrementTournamentPlayedDB(user.getId());

        user.setTournament(tournament);
        const stats = this.ensureUserStats(user);
        if (stats) stats.tournamentsPlayed += 1;

        return (true);
    }

    removeTournament(tournament_id) { 
        LOGGER(200, "UserManager", "removeTournament", "deleted tournament id: " + tournament_id);
        this.tournaments.delete(tournament_id);
    }

    stopTournament(tournament) {

        this.removeTournament(tournament.getId());

        const winner_user = tournament.getWinner();
        if (winner_user === null) return;
        
        tournament.sendFinalWin(winner_user);
        
        if (winner_user) {
            winner_user.tournaments_played = (winner_user.tournaments_played || 0) + 1;
            winner_user.tournaments_won = (winner_user.tournaments_won || 0) + 1;
            this.saveGameStatsToDB(winner_user.id, null, "tournament_win");
        }

        LOGGER(200, "UserManager", "updateTournaments", "User: " + tournament.players.get(winner_user).alias + " won the game!");
        winner_user.unsetTournament();
    }

    updateTournaments() {
        this.tournaments.forEach(tournament => {
            if (tournament.TESTING !== true) {
                if (tournament.getCurrentSize() === 0 && tournament.TESTING === false) {
                    this.removeTournament(tournament.getId());
                }
                if (tournament.isWaitingAndFull() && tournament.TESTING === false) {
                    LOGGER(200, "USerManager.js", "updateTournaments", "Tournament is waiting and full");
                    tournament.setReady();
                    this.createNewTournamentMatches(tournament.getPlayers(), tournament);
                }
                else if (tournament.isRoundFinished() && tournament.TESTING === false) {
                    const winners = tournament.prepareNextRound();
                    if (winners.size > 1) {
                        this.createNewTournamentMatches(winners, tournament);
                    }
                    else {
                        this.stopTournament(tournament);
                    }
                }
            }
        });
    }

    createNewTournamentMatches(playerMap, tournament) {
        LOGGER(200, "UserManager", "createNewTournamentMatches", "Called");
        const players = Array.from(playerMap.keys());

        for (let i = 0; i < players.length; i += 2) {
            const user1 = players[i];
            const user2 = (i + 1 < players.length) ? players[i + 1] : null;
            const match = this.createMatch(user1, false, tournament);
            if (user2) this.addToMatch(user2, match);
            tournament.matches.set(match, {user1 , user2});
            tournament.sendMatchStart(user1, user2);
            tournament.sendMatchStart(user2, user1);
            if (!user2) {
                this.stopMatch(match);
            }
        }
    }

    getAvailableTournaments() { 
        LOGGER(200, "UserManager", "getAvailableTournaments", "Called");
        const tournaments = [];
        for (const tournament of this.tournaments.values()) {
            tournaments.push({
                id: tournament.getTournamentId(),
                creator: tournament.getCreatorAlias(),
                max_size: tournament.getTournamentSize(),
                current_size: tournament.getCurrentSize(),
                full: tournament.isWaitingAndFull()
            });
        }
        if (tournaments.length === 0) { 
            return (null);
        }
        return (tournaments);
    }

    getTournamentById(tournament_id) {
        if (!this.tournaments.has(tournament_id)) return (null);
        return (this.tournaments.get(tournament_id));
    }

//----------------------------------------------------------------------------------------UTILS  

    updateGames() {
        if (this.matches.length !== 0) { this.updateMatches(); }
        if (this.tournaments.length !== 0) { this.updateTournaments(); }
    }

    createId() {
        const rand = Math.floor(Math.random() * 0xffff);
        const time = Date.now();
        return (((time << 16) | rand).toString());
    }
}

module.exports = UserManager;