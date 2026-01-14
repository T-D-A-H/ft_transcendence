const LOGGER = require("../LOGGER.js");

class User {
    
    constructor({ id, username, display_name, socket }) {
        LOGGER(200, "User", "Constructor", "called for " + username);

        this.id = id;
        this.username = username;
        this.display_name = display_name;
        this.socket = socket;
        this.isConnected = false;

        this.currentMatch = null;
        this.pendingMatchRequests = new Map();
        this.currentTournament = null;
        this.isPlaying = false;

    }

    // Enviar mensaje al jugador vía WebSocket
    send(message) {
        if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify(message));
        }
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

    setConnected(connected) {
        this.isConnected = connected;
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


    setTournament(currentTournament) {
        this.currentTournament = currentTournament;
    }

    unsetTournament() {
        this.currentTournament = null;
    }


    getId() {return this.id;}
    getUsername() {return this.username;}
    getDisplayName() {return this.display_name;}
    getSocket() {return this.socket;}
    getIsConnected() {return this.isConnected;}
    getCurrentMatch() {return this.currentMatch;}
    getIsPlaying() {return this.isPlaying;}
    getCurrentTournament() {return this.currentTournament;}
}

module.exports = User;