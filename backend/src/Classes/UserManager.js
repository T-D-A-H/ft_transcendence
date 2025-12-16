const User = require("./User.js");
const Match = require("./Match.js");
const LOGGER = require("../LOGGER.js");
const Tournament = require("./Tournament.js");

class UserManager {

    constructor() {
        LOGGER(200, "UserManager", "Constructor", "Called");
        this.users = new Map();
        this.matches = new Map();
        this.tournaments = new Map();
        this.tournament_id = 0;
        this.pending2FA = new Map();
    }

    set2FACode(userId, code) {
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutos de validez
        this.pending2FA.set(userId, { code, expiresAt });
    }

    verify2FACode(userId, code) {
        const record = this.pending2FA.get(userId);
        if (!record) return false;

        if (record.expiresAt < Date.now()) {
            this.pending2FA.delete(userId);
            return false; // Código expirado
        }

        if (record.code !== Number(code))
            return false;

        // Código correcto, eliminar del registro
        this.pending2FA.delete(userId);
        return true;
    }

    addUser(user) {
        LOGGER(200, "UserManager", "addUser", user.getUsername());
        this.users.set(user.id, user);
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
            const match = user.getCurrentMatch()
            if (match !== null) {
                LOGGER(200, "UserManager", "logoutUser", user.getUsername() + " got sent disconnect msg.");
                match.broadcast({type: "DISCONNECT", msg: user.getUsername() + " disconnected."});
                this.removeMatch(match);
            }
            return true;
        }
        LOGGER(400, "UserManager", "logoutUser", userId + "already logged out.");
        return false;
    }

    removeUser(userId) {

        const removed = this.users.delete(userId);
        if (removed) {
            LOGGER(200, "UserManager", "removeUser", this.users.get(userId));
        }
        return (removed);
    }

    createMatchId() {

    	const rand = Math.floor(Math.random() * 0xffff);
    	const time = Date.now();
    	return ((time << 16) | rand);
    }

	createMatch(user, locally) {
        LOGGER(200, "UserManager", "createMatch", user.getUsername());
        const match_id = this.createMatchId();
		const match = new Match(user, match_id, locally);
        return (match);
	}

	removeMatch(match) {
        LOGGER(200, "UserManager", "removeMatch", match.id);
        if (match.players[0] !== null)
            match.players[0].unsetMatch();
         if (match.players[1] !== null)
            match.players[1].unsetMatch();
		this.matches.delete(match.id);
	}

    findMatch(user) {

        if (this.matches.length === 0) return (null);
        for (const match of this.matches) {

            if (match.players[0] === user) {
                LOGGER(503, "UserManager", "findMatch", "Found Current User already in a match");
                return (match);
            }
        }
        LOGGER(200, "UserManager", "findMatch", "Current User not in existing match");
        return (null)
    }

    addToMatch(requestingUser, user) {

        const matches = this.getAllMatches();
        for (const match of matches) {

            if (match.players[0] === user) {

                if (match.players[1] === null) {
                    match.addUserToMatch(requestingUser);
                    match.players[0].setMatch(match);
                    match.players[1].setMatch(match);
                    LOGGER(200, "UserManager", "addToMatch", "Added " + user.getUsername() + " to match["  + match.id + "] against " + match.players[0].getUsername());
                    return (match);
                }
                LOGGER(502, "UserManager", "addToMatch", "match already full");
                return (null);
            }
        }
        LOGGER(502, "UserManager", "addToMatch", "Couldnt find match");
        return (null);
    }
  
    createTournamentId() {
    	const rand = Math.floor(Math.random() * 0xffff);
    	const time = Date.now();
    	return ((time << 16) | rand);
    }

    createTournament(alias, numPlayers, locally) {

        LOGGER(200, "UserManager", "createTournament", "created");
        const tournament_id = this.createTournamentId();
        const creator_alias = (alias === null) ? "Anonymous" : alias;
		const tournament = new Tournament(creator_alias, tournament_id, numPlayers, locally);
        setTournament(tournament_id, tournament);
        return (tournament);
    }

    setTournament(tournament_id, tournament) {
        this.tournaments.set(tournament_id, tournament);
    }

    getUserByID(userId) {
        return this.users.get(userId);
    }

    getUserByUsername(username) {
        for (const user of this.users.values()) {
            if (user.display_name === username) {
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

    getAllMatches() {
        return (Array.from(this.matches.values()));
    }

    getMatches(all_or_waiting) {
        let state = null;
        if (all_or_waiting === "waiting") state = true;
        else if (all_or_waiting === "all") state = false;

        const current_matches = [];
        for (const match of this.matches.values()) {
            if (match.isWaiting === state) {
                LOGGER(200, "UserManager", "getMatches", "Match[" + match.id + "] with " + match.players[0].getUsername() + " available");
                current_matches.push(match);
            }
        }
        return (current_matches);
    }

    getMatchId() {
        return (this.match_id);
    }

    getTournamentById(tournament_id) {

    	if (!this.tournaments.has(tournament_id))
    		return (null);

    	return (this.tournaments.get(tournament_id));
    }

    getAvailableTournaments() {

    	const tournaments = [];

    	for (const tournament of this.tournaments.values()) {

    		if (tournament.getIsWaiting() === true) {

    			tournaments.push({
    				id: tournament.getTournamentId(),
    				creator: tournament.getCreatorAlias(),
    				max_size: tournament.getTournamentSize(),
    				current_size: tournament.getCurrentSize()
    			});
    		}
    	}

    	if (tournaments.length === 0)
    		return (null);

    	return (matches);
    }



}

module.exports = UserManager;