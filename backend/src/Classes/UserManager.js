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
        this.pending2FA = new Map();
    }

//----------------------------------------------------------------------------------------USER


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

//----------------------------------------------------------------------------------------USER
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

        match.addUserToMatch(requestingUser);
        requestingUser.setMatch(match);
    }

	removeMatch(match) {
        LOGGER(200, "UserManager", "removeMatch", match.id);
        if (match.players[0] !== null)
            match.players[0].unsetMatch();
         if (match.players[1] !== null)
            match.players[1].unsetMatch();
		this.matches.delete(match.id);
	}

    stopMatch(match) {

        const WINNER = match.getWinner();
        const tournament = match.getTournament();

        if (tournament !== null) {

            tournament.updateWinner(match, WINNER);
        }
        this.removeMatch(match);
    }

    updateMatches(matches) {

        if (this.matches.length !== 0) return ;
        matches.forEach(match => {

			if (match.someoneWon() === true) {
                this.stopMatch(match)
				return ;
		    }
			if (match.shouldContinuePlaying())
				match.updateMatch();		
        });
    }


//----------------------------------------------------------------------------------------MATCH
//----------------------------------------------------------------------------------------TOURNAMENT  


    createTournament(user, alias) {

        LOGGER(200, "UserManager", "createTournament", "created");

        const creator_alias = (alias === null) ? "Anonymous" : alias;
        const tournament_id = this.createId();
		const tournament = new Tournament(tournament_id);

        tournament.addCreatorAlias(creator_alias);
        this.tournaments.set(tournament_id, tournament);
        tournament.addUserToTournament(user, creator_alias);
		user.setCurrentTournament(tournament);
    }

    updateTournaments() {

    	if (this.matches.length !== 0)
    		this.updateMatches(this.matches);

    	this.tournaments.forEach(tournament => {

    		if (tournament.isWaitingAndFull()) {

                tournament.setReady();
    			this.createNewTournamentMatches(tournament.getPlayers(), tournament);
    		}
    		if (tournament.isRoundFinished()) {

    			const winners = tournament.prepareNextRound();

    			if (winners.size > 1)
    				this.createNewTournamentMatches(winners, tournament);

                if (tournament.isTournamentFinished()) {
                    tournament.isReady = false;
                    tournament.isWaiting = false;
                }
    		}
    	});
    }


    createNewTournamentMatches(playerMap, tournament) {

	    const players = Array.from(playerMap.keys());

	    for (let i = 0; i < players.length; i += 2) {

            const user1 = players[i];
            const user2 = (i + 1 < players.length) ? players[i + 1] : null;
	    	const match = this.createMatch(user1, false, tournament);

            if (user2)
                this.addToMatch(user2, match);
  
	    	tournament.matches.set(match, {user1 , user2});

            if (!user2) {
                tournament.winners.set(user1, tournament.players.get(user1));
                tournament.matchDoneCount++;
            }
	    }
}


//----------------------------------------------------------------------------------------TOURNAMENT 
//----------------------------------------------------------------------------------------UTILS  

    getAllMatches() {
        return (Array.from(this.matches.values()));
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

    	return (tournaments);
    }

    getTournamentById(tournament_id) {

    	if (!this.tournaments.has(tournament_id))
    		return (null);

    	return (this.tournaments.get(tournament_id));
    }

    createId() {

    	const rand = Math.floor(Math.random() * 0xffff);
    	const time = Date.now();
    	return ((time << 16) | rand);
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

//----------------------------------------------------------------------------------------UTILS  
}

module.exports = UserManager;