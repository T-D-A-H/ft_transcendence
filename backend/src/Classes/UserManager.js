const User = require("./User.js");
const Match = require("./Match.js");
const LOGGER = require("../LOGGER.js");

class UserManager {

    constructor() {
        LOGGER(200, "UserManager", "Constructor", "Called");
        this.users = new Map();
        this.matches = new Map();
        this.pending2FA = new Map();
        this.match_id = 1;
    }

    // Guardar código 2FA temporal
    set2FACode(userId, code) {
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutos de validez
        this.pending2FA.set(userId, { code, expiresAt });
    }

    // Verificar código 2FA
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

    // Agregar usuario
    addUser(user) {
        LOGGER(200, "UserManager", "addUser", user.getUsername());
        this.users.set(user.id, user);
    }

    // Crear y agregar usuario
    createUser(userData) {
        LOGGER(200, "UserManager", "createUser", user.getUsername());
        const user = new User(userData);
        this.addUser(user);
        return user;
    }

    // Login de usuario
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

    // Logout de usuario
    logoutUser(userId) {
        const user = this.users.get(userId);
        if (user) {
            LOGGER(200, "UserManager", "logoutUser", user.getUsername());
            user.setConnected(false);
            const match = user.getCurrentMatch()
            if (match !== null) {
                match.broadcast({type: "DISCONNECT", msg: user.getUsername() + " disconnected."});
                this.removeMatch(match);
            }
            return true;
        }
        LOGGER(400, "UserManager", "logoutUser", userId + "already logged out.");
        return false;
    }

    

    // Obtener usuario por ID
    getUserByID(userId) {
        return this.users.get(userId);
    }

    // Obtener usuario por username
    getUserByUsername(username) {
        for (const user of this.users.values()) {
            if (user.display_name === username) {
                return user;
            }
        }
        return null;
    }

    // Eliminar usuario
    removeUser(userId) {

        const removed = this.users.delete(userId);
        if (removed) {
            LOGGER(200, "UserManager", "removeUser", this.users.get(userId));
        }
        return (removed);
    }

    // Obtener todos los usuarios conectados
    getConnectedUsers() {
        const connected = [];
        for (const user of this.users.values()) {
            if (user.isConnected) {
                connected.push(user);
            }
        }
        return connected;
    }

    // Contar usuarios conectados
    getConnectedCount() {
        return this.getConnectedUsers().length;
    }

    // Obtener todos los usuarios
    getAllUsers() {
        return Array.from(this.users.values());
    }

    // Create Match Id
    createMatchId() {
        this.match_id++;
        return (this.match_id);
    }

    // Create a new match
	createMatch(user, locally) {
        LOGGER(200, "UserManager", "createMatch", user.getUsername());
        const match_id = this.match_id;
		const match = new Match(user, match_id, locally);
        this.matches.set(match_id, match);
        this.match_id++;
        return (match);
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

	// Remove a finished match
	removeMatch(match) {
        LOGGER(200, "UserManager", "removeMatch", match.id);
		this.matches.delete(match.id);
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

}

module.exports = UserManager;