const hre = require("hardhat");

async function main() {
	console.log("Querying Tournament Results from Blockchain\n");
	
	const fs = require("fs");
	const path = require("path");
	const deploymentPath = path.join(__dirname, "../deployment-info.json");
	
	if (!fs.existsSync(deploymentPath)) {
	console.error("Deployment info not found.");
	process.exit(1);
	}
	
	const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
	const contractAddress = deploymentData[hre.network.name]?.contractAddress;
	
	console.log("Contract Address:", contractAddress);
	console.log("Network:", hre.network.name);
	console.log("Explorer:", `https://testnet.snowtrace.io/address/${contractAddress}\n`);
	
	const TournamentScores = await hre.ethers.getContractFactory("TournamentScores");
	const contract = TournamentScores.attach(contractAddress);
	
	const tournamentCount = await contract.getTournamentCount();
	console.log("Total Tournaments on Blockchain:", tournamentCount.toString(), "\n");
	
	for (let i = 1; i <= Number(tournamentCount); i++) {
	console.log(`\n${"=".repeat(60)}`);
	console.log(`TOURNAMENT #${i}`);
	console.log("=".repeat(60));
	
	try {
		const tournament = await contract.getTournament(i);
		console.log("Name:", tournament.tournamentName);
		console.log("Start Time:", new Date(Number(tournament.startTime) * 1000).toLocaleString());
		console.log("End Time:", new Date(Number(tournament.endTime) * 1000).toLocaleString());
		console.log("Finalized:", tournament.isFinalized);
		console.log("Creator:", tournament.creator);
		
		const players = await contract.getTournamentPlayers(i);
		console.log("\nPlayers:", players.length);
		
		console.log("\nScores:");
		for (let j = 0; j < players.length; j++) {
		try {
			const playerScore = await contract.getPlayerScore(i, players[j]);
			console.log(`${j + 1}. ${playerScore.playerName}`);
			console.log(`Address: ${playerScore.playerAddress}`);
			console.log(`Score: ${playerScore.score.toString()} points`);
			console.log(`Recorded: ${new Date(Number(playerScore.timestamp) * 1000).toLocaleString()}`);
		} catch (error) {
			console.log(`Error getting score for ${players[j]}`);
		}
		}
		
		if (tournament.isFinalized) {
		console.log("\nFINAL RANKINGS:");
		const [rankedPlayers, rankedScores, finalizedAt] = await contract.getTournamentResults(i);
		
		for (let k = 0; k < rankedPlayers.length; k++) {
			const playerInfo = await contract.getPlayerScore(i, rankedPlayers[k]);
			const medal = k === 0 ? "🥇" : k === 1 ? "🥈" : k === 2 ? "🥉" : "	";
			console.log(`${medal} #${k + 1}: ${playerInfo.playerName} - ${rankedScores[k].toString()} points`);
		}
		console.log(`Finalized: ${new Date(Number(finalizedAt) * 1000).toLocaleString()}`);
		} else {
		console.log("\nTournament not yet finalized");
		}
		
	} catch (error) {
		console.log("Error querying tournament:", error.message);
	}
	}
	
	console.log("\n" + "=".repeat(60));
	console.log("Query Complete");
	console.log("=".repeat(60));
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
	console.error("Query failed:");
	console.error(error);
	process.exit(1);
	});
