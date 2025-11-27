const User = require("./User.js");

class UserManager {
    constructor() {
        this.users = new Map(); // Map<id, User>
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

}

module.exports = UserManager;