const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

class BlockchainService {
	constructor() {
	this.provider = null;
	this.wallet = null;
	this.contract = null;
	this.contractAddress = null;
	this.isInitialized = false;
	this.scheduledFinalizations = new Map();
	}

	async initialize() {
	try {
		console.log("Initializing Blockchain Service...");

		if (!process.env.AVALANCHE_FUJI_RPC_URL) {
		throw new Error("AVALANCHE_FUJI_RPC_URL not set in environment");
		}
		if (!process.env.PRIVATE_KEY) {
		throw new Error("PRIVATE_KEY not set in environment");
		}
		if (!process.env.CONTRACT_ADDRESS) {
		throw new Error("CONTRACT_ADDRESS not set in environment");
		}

		this.provider = new ethers.JsonRpcProvider(
		process.env.AVALANCHE_FUJI_RPC_URL
		);

		this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
		console.log("Connected wallet:", this.wallet.address);

		this.contractAddress = process.env.CONTRACT_ADDRESS;

		const contractABI = this.loadContractABI();

		this.contract = new ethers.Contract(
		this.contractAddress,
		contractABI,
		this.wallet
		);

		this.contract.on("TournamentCreated", async (tournamentId, tournamentName, creator, timestamp, event) => {
			try {
				const id = Number(tournamentId);
				console.log(`Event: TournamentCreated id=${id} name=${tournamentName} creator=${creator}`);
				await this.scheduleFinalization(id);
			} catch (err) {
				console.error("Error handling TournamentCreated event:", err.message || err);
			}
		});

		this.contract.on("TournamentFinalized", (tournamentId, timestamp) => {
			const id = Number(tournamentId);
			console.log(`Event: TournamentFinalized id=${id}`);
			this.cancelScheduledFinalization(id);
		});

		this.recoverAndScheduleExistingTournaments().catch((e) => {
			console.warn("Recovery scheduling failed:", e.message || e);
		});

		const network = await this.provider.getNetwork();
		console.log("Connected to network:", network.name, "Chain ID:", network.chainId.toString());
		console.log("Contract address:", this.contractAddress);

		this.isInitialized = true;
		console.log("Blockchain Service initialized successfully");

		return true;
	} catch (error) {
		console.error("Failed to initialize Blockchain Service:", error.message);
		throw error;
	}
	}

	loadContractABI() {
	const candidates = [];
	if (process.env.CONTRACT_ARTIFACT_PATH) candidates.push(process.env.CONTRACT_ARTIFACT_PATH);
	candidates.push(path.join(__dirname, '..', '..', '..', 'database', 'blockchain', 'artifacts', 'contracts', 'TournamentScores.sol', 'TournamentScores.json'));
	candidates.push(path.join(process.cwd(), 'database', 'blockchain', 'artifacts', 'contracts', 'TournamentScores.sol', 'TournamentScores.json'));
	candidates.push('/app/blockchain/artifacts/contracts/TournamentScores.sol/TournamentScores.json');

	for (const p of candidates) {
		if (!p) continue;
		if (fs.existsSync(p)) {
			const artifact = JSON.parse(fs.readFileSync(p, 'utf8'));
			return artifact.abi;
		}
	}

	throw new Error(
		"Contract artifact not found. Please compile the contract first with: cd database/blockchain && npx hardhat compile, or set CONTRACT_ARTIFACT_PATH to the artifact location"
	);
	}


	async scheduleFinalization(tournamentId) {
		this.ensureInitialized();
		if (!tournamentId) return;

		if (this.scheduledFinalizations.has(tournamentId)) {
			console.log(`Finalization already scheduled for tournament ${tournamentId}`);
			return;
		}

		const tournament = await this.getTournament(tournamentId);
		if (!tournament) return;
		if (tournament.isFinalized) {
			console.log(`Tournament ${tournamentId} is already finalized; skipping schedule.`);
			return;
		}

		const now = Date.now();
		const endMs = Number(tournament.endTime) * 1000;
		const delay = endMs - now;

		if (delay <= 0) {
			console.log(`Tournament ${tournamentId} has already ended; finalizing now.`);
			try {
				await this.finalizeTournament(tournamentId);
			} catch (err) {
				console.error(`Auto-finalize failed for ${tournamentId}:`, err.message || err);
			}
			return;
		}

		const timer = setTimeout(async () => {
			console.log(`Auto-finalizing tournament ${tournamentId} after delay ${delay}ms`);
			try {
				await this.finalizeTournament(tournamentId);
			} catch (err) {
				console.error(`Auto-finalize failed for ${tournamentId}:`, err.message || err);
			}
			this.scheduledFinalizations.delete(tournamentId);
		}, delay);

		this.scheduledFinalizations.set(tournamentId, timer);
		console.log(`Scheduled finalization for tournament ${tournamentId} in ${(delay/1000).toFixed(1)}s`);
	}

	cancelScheduledFinalization(tournamentId) {
		if (this.scheduledFinalizations.has(tournamentId)) {
			clearTimeout(this.scheduledFinalizations.get(tournamentId));
			this.scheduledFinalizations.delete(tournamentId);
			console.log(`Cancelled scheduled finalization for tournament ${tournamentId}`);
		}
	}

	async recoverAndScheduleExistingTournaments() {
		this.ensureInitialized();
		const count = await this.getTournamentCount();
		for (let id = 1; id <= count; id++) {
			try {
				const t = await this.getTournament(id);
				if (t && !t.isFinalized) {
					await this.scheduleFinalization(id);
				}
			} catch (err) {
			}
		}
	}

	async createTournament(tournamentName, startTime, endTime) {
	this.ensureInitialized();

	try {
		console.log(`Creating tournament: ${tournamentName}`);

		const tx = await this.contract.createTournament(
		tournamentName,
		startTime,
		endTime
		);

		console.log("Waiting for transaction confirmation...");
		const receipt = await tx.wait();

		const event = receipt.logs.find(
		(log) => log.fragment && log.fragment.name === "TournamentCreated"
		);

		const tournamentId = event ? event.args[0] : await this.contract.getTournamentCount();

		console.log(`Tournament created with ID: ${tournamentId}`);
		console.log(`Transaction hash: ${receipt.hash}`);

		return Number(tournamentId);
	} catch (error) {
		console.error("Failed to create tournament:", error.message);
		throw error;
	}
	}

	async recordScore(tournamentId, playerAddress, playerName, score) {
	this.ensureInitialized();

	try {
		console.log(`Recording score for ${playerName}: ${score} points`);

		const tx = await this.contract.recordScore(
		tournamentId,
		playerAddress,
		playerName,
		score
		);

		console.log("Waiting for transaction confirmation...");
		const receipt = await tx.wait();

		console.log(`Score recorded successfully`);
		console.log(`Transaction hash: ${receipt.hash}`);
		return {
		success: true,
		transactionHash: receipt.hash,
		blockNumber: receipt.blockNumber,
		};
	} catch (error) {
		console.error("Failed to record score:", error.message);
		throw error;
	}
	}

	async finalizeTournament(tournamentId) {
	this.ensureInitialized();

	try {
		console.log(`Finalizing tournament ${tournamentId}...`);

		const tx = await this.contract.finalizeTournament(tournamentId);

		console.log("Waiting for transaction confirmation...");
		const receipt = await tx.wait();

		console.log(`Tournament finalized successfully`);
		console.log(`Transaction hash: ${receipt.hash}`);
		return {
		success: true,
		transactionHash: receipt.hash,
		blockNumber: receipt.blockNumber,
		};
	} catch (error) {
		console.error("Failed to finalize tournament:", error.message);
		throw error;
	}
	}

	async getTournament(tournamentId) {
	this.ensureInitialized();

	try {
		const tournament = await this.contract.getTournament(tournamentId);

		return {
		tournamentId: Number(tournament.tournamentId),
		tournamentName: tournament.tournamentName,
		startTime: Number(tournament.startTime),
		endTime: Number(tournament.endTime),
		isFinalized: tournament.isFinalized,
		creator: tournament.creator,
		};
	} catch (error) {
		console.error("Failed to get tournament:", error.message);
		throw error;
	}
	}

	async getPlayerScore(tournamentId, playerAddress) {
	this.ensureInitialized();

	try {
		const playerScore = await this.contract.getPlayerScore(
		tournamentId,
		playerAddress
		);

		return {
		playerAddress: playerScore.playerAddress,
		playerName: playerScore.playerName,
		score: Number(playerScore.score),
		timestamp: Number(playerScore.timestamp),
		isValid: playerScore.isValid,
		};
	} catch (error) {
		console.error("Failed to get player score:", error.message);
		throw error;
	}
	}

	async getTournamentPlayers(tournamentId) {
	this.ensureInitialized();

	try {
		const players = await this.contract.getTournamentPlayers(tournamentId);
		return players;
	} catch (error) {
		console.error("Failed to get tournament players:", error.message);
		throw error;
	}
	}

	async getTournamentResults(tournamentId) {
	this.ensureInitialized();

	try {
		const [rankedPlayers, rankedScores, finalizedAt] =
		await this.contract.getTournamentResults(tournamentId);

		const results = [];
		for (let i = 0; i < rankedPlayers.length; i++) {
		const playerScore = await this.getPlayerScore(
			tournamentId,
			rankedPlayers[i]
		);
		results.push({
			rank: i + 1,
			playerAddress: rankedPlayers[i],
			playerName: playerScore.playerName,
			score: Number(rankedScores[i]),
		});
		}

		return {
		tournamentId,
		rankings: results,
		finalizedAt: Number(finalizedAt),
		};
	} catch (error) {
		console.error("Failed to get tournament results:", error.message);
		throw error;
	}
	}

	async getTournamentCount() {
	this.ensureInitialized();

	try {
		const count = await this.contract.getTournamentCount();
		return Number(count);
	} catch (error) {
		console.error("Failed to get tournament count:", error.message);
		throw error;
	}
	}

	async verifyScoreIntegrity(tournamentId, playerAddress, expectedScore) {
	this.ensureInitialized();

	try {
		const isValid = await this.contract.verifyScoreIntegrity(
		tournamentId,
		playerAddress,
		expectedScore
		);
		return isValid;
	} catch (error) {
		console.error("Failed to verify score integrity:", error.message);
		throw error;
	}
	}

	async getBalance() {
	this.ensureInitialized();

	try {
		const balance = await this.provider.getBalance(this.wallet.address);
		return ethers.formatEther(balance);
	} catch (error) {
		console.error("Failed to get balance:", error.message);
		throw error;
	}
	}

	ensureInitialized() {
	if (!this.isInitialized) {
		throw new Error(
		"Blockchain service not initialized. Call initialize() first."
		);
	}
	}
}

module.exports = new BlockchainService();
