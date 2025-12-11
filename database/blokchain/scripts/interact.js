const hre = require("hardhat");

async function main() {
	console.log("Testing TournamentScores contract interaction...\n");

	const fs = require("fs");
	const path = require("path");
	const deploymentPath = path.join(__dirname, "../deployment-info.json");
	
	if (!fs.existsSync(deploymentPath)) {
	console.error("Deployment info not found. Please deploy the contract first.");
	process.exit(1);
	}
	
	const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
	const contractAddress = deploymentData[hre.network.name]?.contractAddress;
	
	if (!contractAddress) {
	console.error(`No deployment found for network: ${hre.network.name}`);
	process.exit(1);
	}
	
	console.log("Contract Address:", contractAddress);
	console.log("Network:", hre.network.name);
	
	const TournamentScores = await hre.ethers.getContractFactory("TournamentScores");
	const contract = TournamentScores.attach(contractAddress);
	
	const [owner] = await hre.ethers.getSigners();
	console.log("Interacting as:", owner.address, "\n");
	
	console.log("Creating a test tournament...");
	const startTime = Math.floor(Date.now() / 1000);
	const endTime = startTime + (7 * 24 * 60 * 60);
	
	const createTx = await contract.createTournament(
	"Test Tournament - December 2025",
	startTime,
	endTime
	);
	await createTx.wait();
	console.log("Tournament created!");
	
	const tournamentCount = await contract.getTournamentCount();
	const tournamentId = tournamentCount;
	console.log("Tournament ID:", tournamentId.toString(), "\n");
	
	console.log("Recording player scores...");
	
	const testPlayers = [
	{ address: owner.address, name: "Player One", score: 1000 },
	{ address: owner.address, name: "Player Two", score: 850 },
	{ address: owner.address, name: "Player Three", score: 950 }
	];
	
	for (const player of testPlayers) {
	const tx = await contract.recordScore(
		tournamentId,
		player.address,
		player.name,
		player.score
	);
	await tx.wait();
	console.log(`Score recorded for ${player.name}: ${player.score}`);
	}
	
	console.log("");
	
	console.log("Retrieving tournament information...");
	const tournament = await contract.getTournament(tournamentId);
	console.log("Name:", tournament.tournamentName);
	console.log("Start Time:", new Date(Number(tournament.startTime) * 1000).toISOString());
	console.log("End Time:", new Date(Number(tournament.endTime) * 1000).toISOString());
	console.log("Finalized:", tournament.isFinalized, "\n");
	
	console.log("Retrieving individual player scores...");
	for (const player of testPlayers) {
	const score = await contract.getPlayerScore(tournamentId, player.address);
	console.log(`	 ${score.playerName}: ${score.score.toString()} points`);
	}
	
	console.log("");
	
	console.log("Getting all tournament players...");
	const players = await contract.getTournamentPlayers(tournamentId);
	console.log("Total Players:", players.length);
	console.log("Players:", players, "\n");
	
	console.log("Finalizing tournament...");
	const finalizeTx = await contract.finalizeTournament(tournamentId);
	await finalizeTx.wait();
	console.log("Tournament finalized!\n");
	
	console.log("Retrieving final ranked results...");
	const [rankedPlayers, rankedScores, finalizedAt] = await contract.getTournamentResults(tournamentId);
	
	console.log("Final Rankings:");
	for (let i = 0; i < rankedPlayers.length; i++) {
	const playerInfo = await contract.getPlayerScore(tournamentId, rankedPlayers[i]);
	console.log(`	 ${i + 1}. ${playerInfo.playerName}: ${rankedScores[i].toString()} points`);
	}
	
	console.log("Finalized At:", new Date(Number(finalizedAt) * 1000).toISOString(), "\n");
	
	console.log("Verifying score integrity...");
	const isValid = await contract.verifyScoreIntegrity(
	tournamentId,
	testPlayers[0].address,
	testPlayers[0].score
	);
	console.log("Score integrity check:", isValid ? "VALID" : "INVALID", "\n");
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
	console.error("Test failed:");
	console.error(error);
	process.exit(1);
	});
