const LOGGER = require("../LOGGER.js");

class User {
    
    static SIDE = { LEFT: -1, RIGHT: 1};

    constructor({ id, username, display_name, socket, avatar }) {
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
        this.displaySide = User.SIDE.RIGHT;

        this.avatar = avatar || "&#9865;";
    }

    send(message) {
        if (this.socket && this.isConnected) {
            this.socket.send(JSON.stringify(message));
        }
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

    unsetMatch() {
        this.currentMatch = null;
    }

    setIsPlaying() {
        this.isPlaying = true;
    }

    unsetIsPlaying() {
        this.isPlaying = false;
    }



	addPendingRequest(target_user, target_username) {
		if (!this.pendingMatchRequests.has(target_username)) {
			this.pendingMatchRequests.set(target_username, target_user);
		}
	}


	removePendingRequest(target_username) {
		this.pendingMatchRequests.delete(target_username);
	}


	hasPendingRequest(target_username) {
		return this.pendingMatchRequests.has(target_username);
	}

	
    listPendingRequests() {
    
    	const requestslist = [];
    
    	const values = Array.from(this.pendingMatchRequests.values());
    
    	for (let i = values.length - 1; i >= 0; --i) {
        
    		const user = values[i];
        
    		requestslist.push({
    			id: user.getId(),
    			display_name: user.getDisplayName(),
    			username: user.getUsername()
    		});
    	}
    
    	if (requestslist.length === 0) {
    		return (null);
    	}
    	return (requestslist);
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

    getId() {return this.id;}
    getUsername() {return this.username;}
    getDisplayName() {return this.display_name;}
    getSocket() {return this.socket;}
    getIsConnected() {return this.isConnected;}
    getCurrentMatch() {return this.currentMatch;}
    getIsPlaying() {return this.isPlaying;}
    getCurrentTournament() {return this.currentTournament;}
    updateDisplayName(newName) {this.display_name = newName;}
    updateUserName(newName) {this.username = newName;}
}

module.exports = User;