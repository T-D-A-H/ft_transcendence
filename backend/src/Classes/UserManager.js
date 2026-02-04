const User = require("./User.js");
const Match = require("./Match.js");
const LOGGER = require("../LOGGER.js");
const Tournament = require("./Tournament.js");
const blockchainService = require("../BlockchainService.js");

class UserManager {

    constructor() {
        LOGGER(200, "UserManager", "Constructor", "Called");
        this.users = new Map();
        this.matches = new Map();
        this.tournaments = new Map();
        this.pending2FA = new Map();
        this.blockchainEnabled = false;
        this.blockchainInitialized = false;
    }

    async initializeBlockchain() {
        try {
            await blockchainService.initialize();
            this.blockchainEnabled = true;
            this.blockchainInitialized = true;
            LOGGER(200, "UserManager", "initializeBlockchain", "Blockchain service initialized");
        } catch (error) {
            LOGGER(400, "UserManager", "initializeBlockchain", "Failed to initialize blockchain: " + error.message);
            this.blockchainEnabled = false;
        }
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
            const match = user.getCurrentMatch();
            if (match)
                this.matchDisconnect(match);

            const tournament = user.getCurrentTournament();
            if (tournament) {
                this.tournamentDisconnect(tournament);
                tournament.removeUserFromTournament(user);
            }
            return true;
        }
        LOGGER(400, "UserManager", "logoutUser", userId + "already logged out.");
        return false;
    }

    removeUser(userId) {

        LOGGER(200, "UserManager", "removeUser", this.users.get(userId));
        const removed = this.users.delete(userId);
        return (removed);
    }

    getUserByID(userId) {
        return this.users.get(userId);
    }

    getUserByUsername(username) {
        for (const user of this.users.values()) {
            if (user.username === username) {
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

    tournamentDisconnect(tournament) {

        LOGGER(200, "UserManager", "tournamentDisconnect", "user disconnected from tournament");
        const winners = tournament.getWinners();

        if (winners === null)
            return ;
    	for (const user of winners.keys()) {

    		if (user.isConnected === false) {

                tournament.deleteWinner(user);

            }
    	}
    }

    matchDisconnect(match) {

        
        if (match.players[0].isConnected === false) {

            LOGGER(400, "UserManager", "checkMatchDisconnect", "player disconnected");
            match.setWINNER(1);
            match.setLOSER(0);
            match.setDisconnect();

        }
        else if (match.players[1].isConnected === false) {

            match.setWINNER(0);
            match.setLOSER(1);
            match.setDisconnect();

            LOGGER(400, "UserManager", "checkMatchDisconnect", "player disconnected");
        }
    }
//----------------------------------------------------------------------------------------USER
//----------------------------------------------------------------------------------------MATCH


	createMatch(user, locally, tournament) { LOGGER(200, "UserManager", "createMatch", user.getUsername());
        
        const match_id = this.createId();
		const match = new Match(user, match_id, locally, tournament);

        this.matches.set(match_id, match);
        user.setMatch(match);
        return (match);
	}

    addToMatch(requestingUser, match) {

        match.getPlayers()[0].setIsPlaying();
        requestingUser.setIsPlaying();
        match.addUserToMatch(requestingUser);
        requestingUser.setMatch(match);
    }

	removeMatch(match) {
        LOGGER(200, "UserManager", "removeMatch", match.id);
		this.matches.delete(match.id);
	}

    unsetMatches(match) {

        if (!match) return;
        if (match.players[0] !== null) {

            match.players[0].unsetMatch();
            match.players[0].unsetIsPlaying();
        }
        if (match.players[1] !== null) {

            match.players[1].unsetMatch();
            match.players[1].unsetIsPlaying();
        }
    }

    stopMatch(match) {
        LOGGER(200, "UserManager", "stopMatch", "called");
        const tournament = match.getTournament();

        if (tournament !== null) {

            LOGGER(200, "UserManager", "stopMatch", "Is part of tournament");
            const winner = match.getWinner();
            const loser = match.getLoser();
            tournament.updateWinner(match, winner);
            tournament.sendWin(winner, loser);

            if (loser) {
                tournament.sendLose(loser, winner)
                loser.unsetTournament();
            }
        }
        else
            match.sendWin(match.getWinner());
        this.sendDisplaySide(match);
        this.unsetMatches(match);
        this.removeMatch(match);
    }

    updateMatches() {

        this.matches.forEach(match => {


            if (match.START === false && match.readyToStart() === true) {
                LOGGER(200, "UserManager.js", "updateMatches", "sent match ready");
                match.sendMatchReady();
            }
            else {
                if (match.someoneWon() === true) {

                    this.stopMatch(match)
                }
                if (match.shouldContinuePlaying()) {

			    	match.updateMatch();
                    // this.matchDisconnect(match);
                }
            }

        });
    }


    sendDisplaySide(match) {
        LOGGER(200, "UserManarger", "sendDIsplaySide", "Swapping display side from: \n");
		match.players.forEach(user => {
			const defaultSide = user.getDisplaySide();
			user.socket.send(JSON.stringify({
				type: "MIRROR",
                msg: defaultSide
			}));
		});
	}


//----------------------------------------------------------------------------------------MATCH
//----------------------------------------------------------------------------------------TOURNAMENT  


    async createTournament(user, alias, size) { LOGGER(200, "UserManager", "createTournament", "Called by user alias: " + alias);

        const tournament_id = this.createId();
		const tournament = new Tournament(user, alias, tournament_id, size);

        // Create tournament on blockchain
        if (this.blockchainEnabled) {
            try {
                const tournamentName = `Tournament ${tournament_id} - ${alias}`;
                const startTime = Math.floor(Date.now() / 1000);
                const endTime = startTime + (7 * 24 * 60 * 60); // 7 days duration
                
                const blockchainId = await blockchainService.createTournament(
                    tournamentName,
                    startTime,
                    endTime
                );
                tournament.blockchainId = blockchainId;
                tournament.blockchainName = tournamentName;
                LOGGER(200, "UserManager", "createTournament", `Created on blockchain with ID: ${blockchainId}`);
            } catch (error) {
                LOGGER(400, "UserManager", "createTournament", "Failed to create on blockchain: " + error.message);
            }
        }

        tournament.addUserToTournament(user, alias);
        this.tournaments.set(tournament_id, tournament);
		user.setTournament(tournament);
        return (tournament);
    }

    addToTournament(user, tournament, alias = null) {

        const user_alias = (alias === null) ? "Anonymous" : alias;
        if (tournament.addUserToTournament(user, user_alias) === false) {
            return (false);
        }
        user.setTournament(tournament);
        return (true);
    }

    removeTournament(tournament_id) { LOGGER(200, "UserManager", "removeTournament", "deleted tournament id: " + tournament_id);

        this.tournaments.delete(tournament_id);
    }

    async stopTournament(tournament) {

        const winner_user = tournament.getWinner();
        if (winner_user === null) {
            this.removeTournament(tournament.getId());
            return;
        }

        // Save all player scores to blockchain before finalizing
        if (this.blockchainEnabled && tournament.blockchainId) {
            try {
                LOGGER(200, "UserManager", "stopTournament", "Saving tournament results to blockchain...");
                console.log("\n" + "=".repeat(70));
                console.log("BLOCKCHAIN TRANSACTION - SAVING TOURNAMENT RESULTS");
                console.log("=".repeat(70));
                console.log(`Tournament: ${tournament.blockchainName}`);
                console.log(`Blockchain ID: ${tournament.blockchainId}`);
                console.log("");
                
                const txHashes = [];
                
                // Record all player scores
                console.log("Recording player scores:");
                for (const [user, playerData] of tournament.players.entries()) {
                    try {
                        // Convert user ID to valid Fuji Testnet address
                        const userId = user.id.toString().replace(/[^a-f0-9]/gi, '').substring(0, 40);
                        const playerAddress = '0x' + userId.padStart(40, '0');
                        const score = tournament.getPlayerScore(user) || 0;
                        
                        const result = await blockchainService.recordScore(
                            tournament.blockchainId,
                            playerAddress,
                            playerData.alias,
                            score
                        );
                        txHashes.push({ type: 'score', player: playerData.alias, tx: result.transactionHash });
                        console.log(`${playerData.alias}: ${score} points`);
                        console.log(`    TX: ${result.transactionHash}`);
                        LOGGER(200, "UserManager", "stopTournament", `Recorded score for ${playerData.alias}: ${score} - TX: ${result.transactionHash}`);
                    } catch (error) {
                        console.log(`✗ ${playerData.alias}: Failed - ${error.message}`);
                        LOGGER(400, "UserManager", "stopTournament", `Failed to record score for ${playerData.alias}: ${error.message}`);
                    }
                }
                console.log("");

                // Finalize tournament on blockchain
                console.log("Finalizing tournament...");
                const finalizeResult = await blockchainService.finalizeTournament(tournament.blockchainId);
                txHashes.push({ type: 'finalize', tx: finalizeResult.transactionHash });
                console.log(`Tournament finalized!`);
                console.log(`    TX: ${finalizeResult.transactionHash}`);
                LOGGER(200, "UserManager", "stopTournament", `Tournament ${tournament.blockchainId} finalized - TX: ${finalizeResult.transactionHash}`);
                console.log("");
                
                // Get and log final results
                const results = await blockchainService.getTournamentResults(tournament.blockchainId);
                console.log("FINAL RANKINGS (verified on blockchain):");
                console.log("-".repeat(70));
                results.rankings.forEach((player, index) => {
                    const medal = index === 0 ? "1. " : index === 1 ? "2. " : index === 2 ? "3. " : "  ";
                    console.log(`${medal} ${index + 1}. ${player.playerName.padEnd(20)} - ${player.score} points`);
                    LOGGER(200, "UserManager", "stopTournament", `${index + 1}. ${player.playerName}: ${player.score} points`);
                });
                console.log("-".repeat(70));
                console.log("");
                
                console.log("BLOCKCHAIN VERIFICATION:");
                console.log(`  Network: Avalanche Fuji Testnet`);
                console.log(`  Contract: ${process.env.CONTRACT_ADDRESS}`);
                console.log(`  View on SnowTrace: https://testnet.snowtrace.io/address/${process.env.CONTRACT_ADDRESS}`);
                console.log("");
                console.log("Transaction Hashes:");
                txHashes.forEach((tx, i) => {
                    if (tx.type === 'score') {
                        console.log(`  ${i + 1}. Score (${tx.player}): https://testnet.snowtrace.io/tx/${tx.tx}`);
                    } else {
                        console.log(`  ${i + 1}. Finalization: https://testnet.snowtrace.io/tx/${tx.tx}`);
                    }
                });
                console.log("=".repeat(70) + "\n");
            } catch (error) {
                console.log(`\n✗ Failed to save to blockchain: ${error.message}\n`);
                LOGGER(400, "UserManager", "stopTournament", "Failed to save to blockchain: " + error.message);
            }
        }

        this.removeTournament(tournament.getId());
        tournament.sendFinalWin(winner_user);
        LOGGER(200, "UserManager", "updateTournaments", "User: " + tournament.players.get(winner_user).alias + " won the game!");
        winner_user.unsetTournament();
    }

    updateTournaments() {

    	this.tournaments.forEach(tournament => {

            if (tournament.TESTING !== true) {

                if (tournament.getCurrentSize() === 0 && tournament.TESTING === false) {
                    this.removeTournament(tournament.getId());
                }
    		    if (tournament.isWaitingAndFull() && tournament.TESTING === false) {

                    LOGGER(200, "USerManager.js", "updateTournaments", "Tournament is waiting and full");
                    tournament.setReady();
    		    	this.createNewTournamentMatches(tournament.getPlayers(), tournament);
    		    }
    		    else if (tournament.isRoundFinished() && tournament.TESTING === false) {

    		    	const winners = tournament.prepareNextRound();

    		    	if (winners.size > 1) {
    		    		this.createNewTournamentMatches(winners, tournament);
                    }
                    else {
                        this.stopTournament(tournament);
                    }
    		    }
            }
    	});
    }

    createNewTournamentMatches(playerMap, tournament) {

        LOGGER(200, "UserManager", "createNewTournamentMatches", "Called");
        
        // Initialize player scores if this is the first round
        if (tournament.matchDoneCount === 0) {
            tournament.initializePlayerScores();
        }
        
	    const players = Array.from(playerMap.keys());

	    for (let i = 0; i < players.length; i += 2) {

            const user1 = players[i];
            const user2 = (i + 1 < players.length) ? players[i + 1] : null;
	    	const match = this.createMatch(user1, false, tournament);

            if (user2)
                this.addToMatch(user2, match);

	    	tournament.matches.set(match, {user1 , user2});
            tournament.sendMatchStart(user1, user2);
            tournament.sendMatchStart(user2, user1);

            if (!user2) {
                this.stopMatch(match);
            }
	    }
    }

    getAvailableTournaments() { LOGGER(200, "UserManager", "getAvailableTournaments", "Called");

        
    	const tournaments = [];

    	for (const tournament of this.tournaments.values()) {


    		tournaments.push({
    			id: tournament.getTournamentId(),
    			creator: tournament.getCreatorAlias(),
    			max_size: tournament.getTournamentSize(),
    			current_size: tournament.getCurrentSize(),
                full: tournament.isWaitingAndFull()
    		});
    	}

    	if (tournaments.length === 0) { LOGGER(501, "UserManager", "getAvailableTournaments", "Called with NO available tournaments");
            
    		return (null);
        }
        LOGGER(200, "UserManager", "getAvailableTournaments", "Called with available tournaments");
    	return (tournaments);
    }

    getTournamentById(tournament_id) {

    	if (!this.tournaments.has(tournament_id))
    		return (null);

    	return (this.tournaments.get(tournament_id));
    }



//----------------------------------------------------------------------------------------TOURNAMENT 
//----------------------------------------------------------------------------------------UTILS  

    updateGames() {

        if (this.matches.length !== 0) {

            this.updateMatches();
        }
        if (this.tournaments.length !== 0) {

            this.updateTournaments();
        }

    }

    createId() {

    	const rand = Math.floor(Math.random() * 0xffff);
    	const time = Date.now();
    	return (((time << 16) | rand).toString());
    }

//----------------------------------------------------------------------------------------UTILS  
}

module.exports = UserManager;