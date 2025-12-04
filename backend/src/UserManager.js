const User = require("./User.js");
const Match = require("./Match.js");

const LOGGER = require("./LOGGER.js");

class UserManager {

    constructor() {
        LOGGER(200, "UserManager: ", "Constructor called");
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
        LOGGER(200, "UserManager: ", "Added user: " + user.getUsername());
        this.users.set(user.id, user);
    }

    // Crear y agregar usuario
    createUser(userData) {
        LOGGER(200, "UserManager: ", "Created user: " + user.getUsername());
        const user = new User(userData);
        this.addUser(user);
        return user;
    }

    // Login de usuario
    loginUser(userId) {
        LOGGER(200, "UserManager: ", "Logged in user: " + userId);
        const user = this.users.get(userId);
        if (user && user.isConnected == false) {
            user.setConnected(true);
            return true;
        }
        return false;
    }

    // Logout de usuario
    logoutUser(userId) {
        LOGGER(200, "UserManager: ", "Logged out user: " + userId);
        const user = this.users.get(userId);
        if (user) {
            user.setConnected(false);
            return true;
        }
        return false;
    }

    // Obtener usuario por ID
    getUser(userId) {
        return this.users.get(userId);
    }

    // Obtener usuario por nombre
    getUserByDisplayName(displayName) {
        for (const user of this.users.values()) {
            if (user.display_name === displayName) {
                return user;
            }
        }
        return null;
    }

    // Eliminar usuario
    removeUser(userId) {
        const removed = this.users.delete(userId);
        if (removed) {
            console.log(`Usuario ${userId} removido. Total: ${this.users.size}`);
        }
        return removed;
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

    createMatchId() {
        this.match_id++;
        return (this.match_id);
    }

    // Create a new match
	createMatch(user) {
        LOGGER(200, "UserManager: ", "createMatch called");
        const match_id = this.match_id;
		const match = new Match(user, match_id);
		user.currentMatch = match;
        this.matches.set(match_id, match);
        this.match_id++;
	}

    findMatch(user) {

        for (const match of this.matches) {

            if (match.players[0] === user) {
                LOGGER(503, "UserManager: ", "Found Current User already in a match");
                return (match);
            }
        }
        LOGGER(200, "UserManager: ", "Current User not in existing match");
        return (null)
    }

	// Remove a finished match
	removeMatch(match) {
        LOGGER(200, "UserManager: ", "removeMatch: " + match.id);
		this.matches.delete(match.id);
	}

    getAllMatches() {
        return (Array.from(this.matches.values()));
    }

    getMatches(all_or_waiting) {
        let state = null;
        if (all_or_waiting === "waiting") state = true;
        else if (all_or_waiting === "all") state = false;

        LOGGER(200, "UserManager: ", "getMatches called: ");
        const current_matches = [];
        for (const match of this.matches.values()) {
            if (match.isWaiting === state) {
                LOGGER(200, "UserManager", "Match[" + match.id + "] =" + match.players[0].getUsername());
                current_matches.push(match);
            }
        }
        return (current_matches);
    }

    addToMatch(user, target_username) {
        LOGGER(200, "UserManager: ", "addToMatch: " + user.getUsername());
        const matches = this.getAllMatches();
        for (const match of matches) {

            if (match.players[0].getUsername() === target_username) {
                if (match.players[1] === null) {
                    match.addUserToMatch(user);
                    match.players[0].setMatch(match);
                    match.players[1].setMatch(match);
                    LOGGER(200, "UserManager: ", "Added user to match["  + match.id + "] against: " + match.players[0].getUsername());
                    return (match);
                }
                LOGGER(502, "UserManager: ", "addToMatch: match already full");
                return (null);
            }
        }
        LOGGER(502, "UserManager: ", "addToMatch: couldnt find match");
        return (null);
    }

}

module.exports = UserManager;