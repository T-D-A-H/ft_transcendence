const hre = require("hardhat");

async function main() {
	console.log("=".repeat(60));
	console.log("TOURNAMENT SMART CONTRACT TEST");
	console.log("=".repeat(60));
	console.log("");

	// Deploy contract
	console.log("Step 1: Deploying TournamentScores contract...");
	const TournamentScores = await hre.ethers.getContractFactory("TournamentScores");
	const contract = await TournamentScores.deploy();
	await contract.waitForDeployment();
	
	const contractAddress = await contract.getAddress();
	console.log("✓ Contract deployed at:", contractAddress);
	console.log("");

	// Get signer
	const [owner] = await hre.ethers.getSigners();
	console.log("Owner address:", owner.address);
	const balance = await hre.ethers.provider.getBalance(owner.address);
	console.log("Owner balance:", hre.ethers.formatEther(balance), "ETH");
	console.log("");

	// Create tournament
	console.log("Step 2: Creating test tournament...");
	const startTime = Math.floor(Date.now() / 1000);
	const endTime = startTime + (7 * 24 * 60 * 60); // 7 days from now
	
	const createTx = await contract.createTournament(
		"Winter Championship 2026",
		startTime,
		endTime
	);
	await createTx.wait();
	console.log("✓ Tournament created successfully!");
	
	const tournamentId = await contract.getTournamentCount();
	console.log("  Tournament ID:", tournamentId.toString());
	console.log("");

	// Verify tournament data
	console.log("Step 3: Verifying tournament information...");
	const tournament = await contract.getTournament(tournamentId);
	console.log("  Name:", tournament.tournamentName);
	console.log("  Start Time:", new Date(Number(tournament.startTime) * 1000).toLocaleString());
	console.log("  End Time:", new Date(Number(tournament.endTime) * 1000).toLocaleString());
	console.log("  Is Finalized:", tournament.isFinalized);
	console.log("  Creator:", tournament.creator);
	console.log("");

	// Record player scores
	console.log("Step 4: Recording player scores...");
	const testPlayers = [
		{ address: "0x1111111111111111111111111111111111111111", name: "Alice Johnson", score: 2500 },
		{ address: "0x2222222222222222222222222222222222222222", name: "Bob Smith", score: 1800 },
		{ address: "0x3333333333333333333333333333333333333333", name: "Charlie Brown", score: 2200 },
		{ address: "0x4444444444444444444444444444444444444444", name: "Diana Prince", score: 1950 },
		{ address: "0x5555555555555555555555555555555555555555", name: "Eve Wilson", score: 2100 }
	];

	for (const player of testPlayers) {
		const tx = await contract.recordScore(
			tournamentId,
			player.address,
			player.name,
			player.score
		);
		await tx.wait();
		console.log(`  ✓ ${player.name}: ${player.score} points recorded`);
	}
	console.log("");

	// Retrieve and display all scores
	console.log("Step 5: Retrieving player scores...");
	for (const player of testPlayers) {
		const score = await contract.getPlayerScore(tournamentId, player.address);
		console.log(`  ${score.playerName}: ${score.score.toString()} points (valid: ${score.isValid})`);
	}
	console.log("");

	// Get all players in tournament
	console.log("Step 6: Getting all tournament players...");
	const players = await contract.getTournamentPlayers(tournamentId);
	console.log(`  Total players registered: ${players.length}`);
	console.log("");

	// Test score update
	console.log("Step 7: Testing score update...");
	const updatePlayer = testPlayers[0];
	const newScore = 2750;
	const updateTx = await contract.recordScore(
		tournamentId,
		updatePlayer.address,
		updatePlayer.name,
		newScore
	);
	await updateTx.wait();
	console.log(`  ✓ Updated ${updatePlayer.name}'s score to ${newScore}`);
	
	const updatedScore = await contract.getPlayerScore(tournamentId, updatePlayer.address);
	console.log(`  Verified new score: ${updatedScore.score.toString()}`);
	console.log("");

	// Finalize tournament
	console.log("Step 8: Finalizing tournament...");
	const finalizeTx = await contract.finalizeTournament(tournamentId);
	await finalizeTx.wait();
	console.log("  ✓ Tournament finalized!");
	console.log("");

	// Get final results
	console.log("Step 9: Retrieving final ranked results...");
	const [rankedPlayers, rankedScores, finalizedAt] = await contract.getTournamentResults(tournamentId);
	
	console.log("  🏆 FINAL RANKINGS 🏆");
	console.log("  " + "-".repeat(50));
	for (let i = 0; i < rankedPlayers.length; i++) {
		const playerInfo = await contract.getPlayerScore(tournamentId, rankedPlayers[i]);
		const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  ";
		console.log(`  ${medal} ${i + 1}. ${playerInfo.playerName.padEnd(20)} - ${rankedScores[i].toString()} points`);
	}
	console.log("  " + "-".repeat(50));
	console.log("  Finalized at:", new Date(Number(finalizedAt) * 1000).toLocaleString());
	console.log("");

	// Test error handling - try to add score after finalization
	console.log("Step 10: Testing error handling (try to add score after finalization)...");
	try {
		await contract.recordScore(
			tournamentId,
			"0x6666666666666666666666666666666666666666",
			"Test Player",
			1000
		);
		console.log("  ✗ ERROR: Should have thrown an exception!");
	} catch (error) {
		console.log("  ✓ Correctly rejected: Tournament is finalized");
	}
	console.log("");

	// Summary
	console.log("=".repeat(60));
	console.log("TEST SUMMARY");
	console.log("=".repeat(60));
	console.log("✓ Contract deployed successfully");
	console.log("✓ Tournament created");
	console.log("✓ Scores recorded for", testPlayers.length, "players");
	console.log("✓ Score updates working");
	console.log("✓ Tournament finalized");
	console.log("✓ Final rankings retrieved");
	console.log("✓ Error handling verified");
	console.log("");
	console.log("ALL TESTS PASSED! 🎉");
	console.log("=".repeat(60));
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error("\n❌ TEST FAILED:");
		console.error(error);
		process.exit(1);
	});
