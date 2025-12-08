const LOGGER = require("../LOGGER.js");

class User {
    
    constructor({ id, username, display_name, socket }) {
        LOGGER(200, "User", "Constructor", "called for " + username);
        this.id = id;
        this.username = username;
        this.display_name = display_name;
        this.socket = socket;
        this.score = 0;
        this.isConnected = false;
        this.currentMatch = null;
        this.isPlaying = false;
        this.pendingMatchRequests = new Map();
    }

    // Enviar mensaje al jugador vía WebSocket
    send(message) {
        if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify(message));
        }
    }

    // Actualizar puntaje
    updateScore(points) {
        this.score += points;
    }

    // Marcar desconexión
    disconnect() {
        this.isConnected = false;
        this.socket = null;
    }

    connect(socket) {
        this.isConnected = true;
        this.socket = socket;
    }

    // Marcar reconexión
    reconnect(socket) {
        this.isConnected = true;
        this.socket = socket;
    }

    setConnected(isConnected) {
        this.isConnected = true;
    }
    
    setMatch(match) {

        this.currentMatch = match;
    }

    unsetMatch() {
        this.currentMatch = null;
    }

    setIsPlaying() {
        this.isPlaying = true;
    }

    unsetIsPlaying() {
        this.isPlaying = false;
    }



	addPendingRequest(target_user) {
		if (!this.pendingMatchRequests.has(target_user.username)) {
			this.pendingMatchRequests.set(target_user.username, target_user);
		}
	}


	removePendingRequest(target_user) {
		const key = target_user.username;
		this.pendingMatchRequests.delete(key);
	}


	hasPendingRequest(target_user) {
		const key = target_user.username;
		return this.pendingMatchRequests.has(key);
	}

	
	listPendingRequests() {
		return Array.from(this.pendingMatchRequests.values());
	}


    getId() {return this.id;}
    getUsername() {return this.username;}
    getDisplayName() {return this.display_name;}
    getSocket() {return this.socket;}
    getScore() {return this.score;}
    getIsConnected() {return this.isConnected;}
    getCurrentMatch() {return this.currentMatch;}
    getIsPlaying() {return this.isPlaying;}
}

module.exports = User;