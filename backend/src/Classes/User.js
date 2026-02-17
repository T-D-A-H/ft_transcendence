const LOGGER = require("../LOGGER.js");
const UserStats = require("./UserStats.js");

class User {
    
    static SIDE = { LEFT: -1, RIGHT: 1};

    constructor({ id, username, display_name, socket, avatar, stats }) {
        LOGGER(200, "User", "Constructor", "called for " + username);

        this.id = id;
        this.username = username;
        this.display_name = display_name;
        this.socket = socket;
        this.isConnected = false;
        
        // Estado del juego
        this.currentMatch = null;
        this.currentTournament = null;
        this.isPlaying = false;
        
        this.pendingRequests = new Map();
        this.displaySide = User.SIDE.RIGHT;
        this.avatar = avatar || "&#9865;";
        this.stats = new UserStats(stats);
    }

    send(message) {
        if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify(message));
        }
    }

    notify(type, msg, info) {
        const payload = {type: type};
        if (msg !== null) {
            payload.msg = msg;
        }
        if (info !== null) {
            payload.info = info;
        }
        this.send(payload);
    }

    disconnect() {
        this.isConnected = false;
        this.socket = null;
    }

    connect(socket) {
        this.isConnected = true;
        this.socket = socket;
    }

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

    setIsPlaying(playing) {
        this.isPlaying = playing;
    }

    _makePendingKey(type, id, userId) {
        return `${type}:${id}:${userId}`;
    }

    addPendingRequest(type, id, targetUserId) {
        const key = this._makePendingKey(type, id, targetUserId);

        if (!this.pendingRequests.has(key)) {
            this.pendingRequests.set(key, {
                type: type,
                id: id,
                user: targetUserId
            });
        }
    }

    addPendingTournamentRequest(type, id, targetUserId) {
        this.addPendingRequest(type, id, targetUserId);
    }

    removePendingRequest(type, id, targetUserId) {
        const key = this._makePendingKey(type, id, targetUserId);
        this.pendingRequests.delete(key);
    }

    hasPendingRequest(type, id, targetUserId) {
        const key = this._makePendingKey(type, id, targetUserId);
        return this.pendingRequests.has(key);
    }

    getPendingRequests() {
        return (this.pendingRequests);
    }

    setTournament(currentTournament) {
        this.currentTournament = currentTournament;
    }

    unsetTournament() {
        this.currentTournament = null;
    }

    changeDisplaySide() {
        if (this.displaySide === User.SIDE.RIGHT) {
            this.displaySide = User.SIDE.LEFT;
        }
        else if (this.displaySide === User.SIDE.LEFT) {
            this.displaySide = User.SIDE.RIGHT;
        }
    }

    getDisplaySide() {
        if (this.displaySide === User.SIDE.RIGHT) {
            return ("right");
        }
        else if (this.displaySide === User.SIDE.LEFT) {
            return ("left");
        }
    }

    isInGame() {
        return (this.currentMatch !== null || this.currentTournament !== null);
    }

    getId() {return this.id;}
    getAvatar() {return this.avatar;}
    getUsername() {return this.username;}
    getDisplayName() {return this.display_name;}
    getSocket() {return this.socket;}
    getIsConnected() {return this.isConnected;}
    getCurrentMatch() {return this.currentMatch;}
    getIsPlaying() {return this.isPlaying;}
    getCurrentTournament() {return this.currentTournament;}

    // 🔥 CORREGIDO: Acceso a través de this.stats
    incrementLocalPlayed() { this.stats.local_played++; }
    incrementLocalWon() { this.stats.local_won++; }
    
    updateDisplayName(newName) {this.display_name = newName;}
    updateUserName(newName) {this.username = newName;}
}

module.exports = User;