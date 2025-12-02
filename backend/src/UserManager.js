const User = require("./User.js");
const Match = require("./Match.js");

class UserManager {

    constructor() {
        this.users = new Map();
        this.matches = new Set();
        this.pending2FA = new Map();
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
        this.users.set(user.id, user);
        console.log(`Usuario ${user.display_name} agregado. Total: ${this.users.size}`);
    }

    // Crear y agregar usuario
    createUser(userData) {
        const user = new User(userData);
        this.addUser(user);
        return user;
    }

    // Login de usuario
    loginUser(userId) {
        const user = this.users.get(userId);
        if (user) {
            user.setConnected(true);
            return true;
        }
        return false;
    }

    // Logout de usuario
    logoutUser(userId) {
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

    // Create a new match
	createMatch(user1, user2) {
		const match = new Match(user1, user2);
		user1.currentMatch = match;
		user2.currentMatch = match;
        this.matches.add(match);
		return match;
	}

	// Remove a finished match
	removeMatch(match) {
		this.matches.delete(match);
	}

}

module.exports = UserManager;