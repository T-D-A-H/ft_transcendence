
const blockchainService = require('./BlockchainService');

class TournamentManager {
	constructor() {
		this.activeTournaments = new Map();
		this.blockchainEnabled = true;
	}

	async initialize() {
		try {
			if (this.blockchainEnabled) {
			await blockchainService.initialize();
			console.log('Tournament Management: Blockchain enabled');
			}
		} catch (error) {
			console.error('Tournament Management: Blockchain disabled due to error:', error.message);
			this.blockchainEnabled = false;
		}
	}

	async createTournament(tournamentData) {
		const { name, startTime, endTime } = tournamentData;
		
		let blockchainTournamentId = null;
		
		if (this.blockchainEnabled) {
			try {
			blockchainTournamentId = await blockchainService.createTournament(
				name,
				startTime,
				endTime
			);
			console.log(`Tournament "${name}" created on blockchain with ID: ${blockchainTournamentId}`);
			} catch (error) {
			console.error('Failed to create tournament on blockchain:', error.message);
			}
		}
		
		const localTournament = {
			id: Date.now(),
			name,
			startTime,
			endTime,
			blockchainId: blockchainTournamentId,
			players: [],
			scores: {},
			isFinalized: false,
			createdAt: new Date()
		};
		
		this.activeTournaments.set(localTournament.id, localTournament);
		
		return localTournament;
	}

	async recordScore(tournamentId, scoreData) {
		const { playerAddress, playerName, score } = scoreData;
		
		const tournament = this.activeTournaments.get(tournamentId);
		if (!tournament) {
			throw new Error('Tournament not found');
		}
		
		if (tournament.isFinalized) {
			throw new Error('Cannot record score: tournament is finalized');
		}
		
		if (this.blockchainEnabled && tournament.blockchainId) {
			try {
			const result = await blockchainService.recordScore(
				tournament.blockchainId,
				playerAddress,
				playerName,
				score
			);
			console.log(`Score recorded on blockchain - TX: ${result.transactionHash}`);
			} catch (error) {
			console.error('Failed to record score on blockchain:', error.message);
			}
		}
		
		if (!tournament.players.includes(playerAddress)) {
			tournament.players.push(playerAddress);
		}
		
		tournament.scores[playerAddress] = {
			playerName,
			score,
			timestamp: Date.now()
		};
		
		return {
			success: true,
			tournamentId,
			playerAddress,
			score
		};
	}

	async finalizeTournament(tournamentId) {
		const tournament = this.activeTournaments.get(tournamentId);
		if (!tournament) {
			throw new Error('Tournament not found');
		}
		
		if (tournament.isFinalized) {
			throw new Error('Tournament already finalized');
		}
		
		if (this.blockchainEnabled && tournament.blockchainId) {
			try {
			const result = await blockchainService.finalizeTournament(
				tournament.blockchainId
			);
			console.log(`Tournament finalized on blockchain - TX: ${result.transactionHash}`);
			} catch (error) {
			console.error('Failed to finalize tournament on blockchain:', error.message);
			}
		}
		
		tournament.isFinalized = true;
		tournament.finalizedAt = new Date();
		
		return {
			success: true,
			tournamentId,
			finalizedAt: tournament.finalizedAt
		};
	}

	async getTournamentResults(tournamentId) {
		const tournament = this.activeTournaments.get(tournamentId);
		if (!tournament) {
			throw new Error('Tournament not found');
		}
		
		let blockchainResults = null;
		
		if (this.blockchainEnabled && tournament.blockchainId && tournament.isFinalized) {
			try {
			blockchainResults = await blockchainService.getTournamentResults(
				tournament.blockchainId
			);
			console.log(`Retrieved results from blockchain`);
			} catch (error) {
			console.error('Failed to get blockchain results:', error.message);
			}
		}
		
		const localResults = Object.entries(tournament.scores)
			.map(([address, data]) => ({
			playerAddress: address,
			playerName: data.playerName,
			score: data.score
			}))
			.sort((a, b) => b.score - a.score)
			.map((player, index) => ({
			...player,
			rank: index + 1
			}));
		
		return {
			tournamentId,
			name: tournament.name,
			isFinalized: tournament.isFinalized,
			localResults,
			blockchainResults: blockchainResults?.rankings || null,
			blockchainVerified: !!blockchainResults
		};
	}

	async verifyScoreIntegrity(tournamentId, playerAddress) {
		const tournament = this.activeTournaments.get(tournamentId);
		if (!tournament || !tournament.blockchainId) {
			return { verified: false, reason: 'Tournament not on blockchain' };
		}
		
		const localScore = tournament.scores[playerAddress];
		if (!localScore) {
			return { verified: false, reason: 'Player not found locally' };
		}
		
		try {
			const isValid = await blockchainService.verifyScoreIntegrity(
			tournament.blockchainId,
			playerAddress,
			localScore.score
			);
			
			return {
			verified: isValid,
			localScore: localScore.score,
			blockchainVerified: isValid
			};
		} catch (error) {
			console.error('Score verification failed:', error.message);
			return { verified: false, reason: error.message };
		}
	}
}

module.exports = new TournamentManager();
