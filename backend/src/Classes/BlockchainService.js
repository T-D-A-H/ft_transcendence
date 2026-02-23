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
        this._pollInterval = null;
        this._lastScannedBlock = null;
        this._POLL_MS = 15_000; // poll every 15s (Fuji ~2s blocks, but no need to hammer it)
    }

    async initialize() {
        try {
            console.log("Initializing Blockchain Service...");

            if (!process.env.AVALANCHE_FUJI_RPC_URL) throw new Error("AVALANCHE_FUJI_RPC_URL not set");
            if (!process.env.PRIVATE_KEY)             throw new Error("PRIVATE_KEY not set");
            if (!process.env.CONTRACT_ADDRESS)        throw new Error("CONTRACT_ADDRESS not set");

            // Clean up previous state
            this._stopPolling();

            this.provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_FUJI_RPC_URL);
            this.wallet   = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
            console.log("Connected wallet:", this.wallet.address);

            this.contractAddress = process.env.CONTRACT_ADDRESS;
            const contractABI    = this.loadContractABI();
            this.contract        = new ethers.Contract(this.contractAddress, contractABI, this.wallet);

            const network = await this.provider.getNetwork();
            console.log("Network:", network.name, "Chain ID:", network.chainId.toString());

            // Start from current block - 1 to avoid re-processing old events on boot
            this._lastScannedBlock = (await this.provider.getBlockNumber()) - 1;

            this.isInitialized = true;

            // Recover tournaments that already exist on-chain
            await this.recoverAndScheduleExistingTournaments().catch(e =>
                console.warn("Recovery scheduling failed:", e.message)
            );

            // Start polling instead of filter-based listening
            this._startPolling();

            console.log("Blockchain Service initialized successfully");
            return true;
        } catch (error) {
            console.error("Failed to initialize Blockchain Service:", error.message);
            throw error;
        }
    }

    // ─── Log Polling (replaces contract.on) ──────────────────────────────────

    _startPolling() {
        if (this._pollInterval) return;

        const tournamentCreatedTopic  = this.contract.interface.getEvent("TournamentCreated").topicHash;
        const tournamentFinalizedTopic = this.contract.interface.getEvent("TournamentFinalized").topicHash;

        this._pollInterval = setInterval(async () => {
            try {
                const latestBlock = await this.provider.getBlockNumber();
                if (latestBlock <= this._lastScannedBlock) return;

                const fromBlock = this._lastScannedBlock + 1;
                const toBlock   = latestBlock;

                const logs = await this.provider.getLogs({
                    address:   this.contractAddress,
                    topics:    [[tournamentCreatedTopic, tournamentFinalizedTopic]],
                    fromBlock,
                    toBlock,
                });

                for (const log of logs) {
                    try {
                        const parsed = this.contract.interface.parseLog(log);
                        if (!parsed) continue;

                        if (parsed.name === "TournamentCreated") {
                            const id = Number(parsed.args.tournamentId ?? parsed.args[0]);
                            console.log(`Event: TournamentCreated id=${id} name=${parsed.args[1]} creator=${parsed.args[2]}`);
                            await this.scheduleFinalization(id);
                        }

                        if (parsed.name === "TournamentFinalized") {
                            const id = Number(parsed.args.tournamentId ?? parsed.args[0]);
                            console.log(`Event: TournamentFinalized id=${id}`);
                            this.cancelScheduledFinalization(id);
                        }
                    } catch (parseErr) {
                        console.warn("Failed to parse log:", parseErr.message);
                    }
                }

                this._lastScannedBlock = toBlock;
            } catch (err) {
                // Don't crash the interval — just log and retry next tick
                console.error("Log polling error:", err.message);
            }
        }, this._POLL_MS);

        console.log(`Event polling started (every ${this._POLL_MS / 1000}s)`);
    }

    _stopPolling() {
        if (this._pollInterval) {
            clearInterval(this._pollInterval);
            this._pollInterval = null;
            console.log("Event polling stopped");
        }
    }

    // ─── The rest of your methods unchanged below ─────────────────────────────

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
        throw new Error("Contract artifact not found. Compile with: cd database/blockchain && npx hardhat compile");
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
            console.log(`Tournament ${tournamentId} already finalized; skipping.`);
            return;
        }

        const now   = Date.now();
        const endMs = Number(tournament.endTime) * 1000;
        const delay = endMs - now;

        if (delay <= 0) {
            console.log(`Tournament ${tournamentId} already ended; finalizing now.`);
            try { await this.finalizeTournament(tournamentId); }
            catch (err) { console.error(`Auto-finalize failed for ${tournamentId}:`, err.message); }
            return;
        }

        const timer = setTimeout(async () => {
            console.log(`Auto-finalizing tournament ${tournamentId}`);
            try { await this.finalizeTournament(tournamentId); }
            catch (err) { console.error(`Auto-finalize failed for ${tournamentId}:`, err.message); }
            this.scheduledFinalizations.delete(tournamentId);
        }, delay);

        this.scheduledFinalizations.set(tournamentId, timer);
        console.log(`Scheduled finalization for tournament ${tournamentId} in ${(delay / 1000).toFixed(1)}s`);
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
                if (t && !t.isFinalized) await this.scheduleFinalization(id);
            } catch (_) {}
        }
    }

    async createTournament(tournamentName, startTime, endTime) {
        this.ensureInitialized();
        try {
            console.log(`Creating tournament: ${tournamentName}`);
            const tx      = await this.contract.createTournament(tournamentName, startTime, endTime);
            const receipt = await tx.wait();
            const event   = receipt.logs.find(log => log.fragment?.name === "TournamentCreated");
            const tournamentId = event ? event.args[0] : await this.contract.getTournamentCount();
            console.log(`Tournament created ID=${tournamentId} tx=${receipt.hash}`);
            return Number(tournamentId);
        } catch (error) {
            console.error("Failed to create tournament:", error.message);
            throw error;
        }
    }

	async recordScore(tournamentId, playerAddress, playerName, score) {
		this.ensureInitialized();
		try {
			const tx = await this.contract.recordScore(
				tournamentId, playerAddress, playerName, score,
				{ nonce: await this.provider.getTransactionCount(this.wallet.address, 'pending') }
			);
			const receipt = await tx.wait();
			return { success: true, transactionHash: receipt.hash, blockNumber: receipt.blockNumber };
		} catch (error) {
			console.error("Failed to record score:", error.message);
			throw error;
		}
	}

	async _isTournamentAlreadyFinalized(tournamentId) {
		try {
			const t = await this.contract.getTournament(tournamentId);
			return t.isFinalized;
		} catch {
			return false;
		}
	}

	async finalizeTournament(tournamentId) {
		this.ensureInitialized();
		try {
			// ✅ Don't re-send if already done on-chain
			const alreadyFinalized = await this._isTournamentAlreadyFinalized(tournamentId);
			if (alreadyFinalized) {
				console.log(`Tournament ${tournamentId} already finalized on-chain, skipping tx`);
				return { success: true, transactionHash: null, alreadyFinalized: true };
			}

			const tx      = await this.contract.finalizeTournament(tournamentId);
			const receipt = await tx.wait();
			return { success: true, transactionHash: receipt.hash, blockNumber: receipt.blockNumber };
		} catch (error) {
			// ✅ If it's a nonce error, the tx likely already landed — check on-chain
			if (error.code === 'NONCE_EXPIRED' || error?.error?.code === -32000) {
				const nowFinalized = await this._isTournamentAlreadyFinalized(tournamentId);
				if (nowFinalized) {
					console.log(`Tournament ${tournamentId}: tx already mined despite nonce error`);
					return { success: true, transactionHash: null, alreadyFinalized: true };
				}
			}
			console.error("Failed to finalize tournament:", error.message);
			throw error;
		}
	}

    async getTournament(tournamentId) {
        this.ensureInitialized();
        try {
            const t = await this.contract.getTournament(tournamentId);
            return {
                tournamentId: Number(t.tournamentId),
                tournamentName: t.tournamentName,
                startTime: Number(t.startTime),
                endTime: Number(t.endTime),
                isFinalized: t.isFinalized,
                creator: t.creator,
            };
        } catch (error) {
            console.error("Failed to get tournament:", error.message);
            throw error;
        }
    }

    async getPlayerScore(tournamentId, playerAddress) {
        this.ensureInitialized();
        try {
            const ps = await this.contract.getPlayerScore(tournamentId, playerAddress);
            return {
                playerAddress: ps.playerAddress,
                playerName: ps.playerName,
                score: Number(ps.score),
                timestamp: Number(ps.timestamp),
                isValid: ps.isValid,
            };
        } catch (error) {
            console.error("Failed to get player score:", error.message);
            throw error;
        }
    }

    async getTournamentPlayers(tournamentId) {
        this.ensureInitialized();
        try {
            return await this.contract.getTournamentPlayers(tournamentId);
        } catch (error) {
            console.error("Failed to get tournament players:", error.message);
            throw error;
        }
    }

    async getTournamentResults(tournamentId) {
        this.ensureInitialized();
        try {
            const [rankedPlayers, rankedScores, finalizedAt] = await this.contract.getTournamentResults(tournamentId);
            const results = [];
            for (let i = 0; i < rankedPlayers.length; i++) {
                const ps = await this.getPlayerScore(tournamentId, rankedPlayers[i]);
                results.push({ rank: i + 1, playerAddress: rankedPlayers[i], playerName: ps.playerName, score: Number(rankedScores[i]) });
            }
            return { tournamentId, rankings: results, finalizedAt: Number(finalizedAt) };
        } catch (error) {
            console.error("Failed to get tournament results:", error.message);
            throw error;
        }
    }

    async getTournamentCount() {
        this.ensureInitialized();
        try {
            return Number(await this.contract.getTournamentCount());
        } catch (error) {
            console.error("Failed to get tournament count:", error.message);
            throw error;
        }
    }

    async verifyScoreIntegrity(tournamentId, playerAddress, expectedScore) {
        this.ensureInitialized();
        try {
            return await this.contract.verifyScoreIntegrity(tournamentId, playerAddress, expectedScore);
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
        if (!this.isInitialized)
            throw new Error("Blockchain service not initialized. Call initialize() first.");
    }
}

module.exports = new BlockchainService();