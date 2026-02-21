const hre = require("hardhat");

async function main() {
	console.log("Deploying TournamentScores contract to Avalanche Fuji testnet...");
	console.log("Network:", hre.network.name);
	
	const TournamentScores = await hre.ethers.getContractFactory("TournamentScores");
	
	const [deployer] = await hre.ethers.getSigners();
	console.log("Deploying contracts with the account:", deployer.address);
	
	const balance = await hre.ethers.provider.getBalance(deployer.address);
	console.log("Account balance:", hre.ethers.formatEther(balance), "AVAX");
	
	console.log("\nDeploying contract...");
	const tournamentScores = await TournamentScores.deploy();
	
	await tournamentScores.waitForDeployment();
	
	const contractAddress = await tournamentScores.getAddress();
	console.log("TournamentScores deployed to:", contractAddress);
	
	const deploymentInfo = {
	network: hre.network.name,
	contractAddress: contractAddress,
	deployer: deployer.address,
	deploymentTime: new Date().toISOString(),
	blockNumber: await hre.ethers.provider.getBlockNumber(),
	chainId: (await hre.ethers.provider.getNetwork()).chainId.toString()
	};
	
	const fs = require("fs");
	const path = require("path");
	
	const deploymentPath = path.join(__dirname, "../deployment-info.json");
	
	let allDeployments = {};
	if (fs.existsSync(deploymentPath)) {
	const existingData = fs.readFileSync(deploymentPath, "utf8");
	allDeployments = JSON.parse(existingData);
	}
	
	allDeployments[hre.network.name] = deploymentInfo;
	
	fs.writeFileSync(
	deploymentPath,
	JSON.stringify(allDeployments, null, 2)
	);
	
	console.log("\nDeployment info saved to:", deploymentPath);
	
	const envPath = path.join(__dirname, "../.env");
	let envContent = "";
	
	if (fs.existsSync(envPath)) {
		envContent = fs.readFileSync(envPath, "utf8");
	}
	
	const contractAddressLine = `CONTRACT_ADDRESS=${contractAddress}`;
	const contractAddressRegex = /^CONTRACT_ADDRESS=.*/m;
	
	if (contractAddressRegex.test(envContent)) {
		envContent = envContent.replace(contractAddressRegex, contractAddressLine);
		console.log("\nUpdated CONTRACT_ADDRESS in .env file");
	} else {
		if (envContent && !envContent.endsWith("\n")) {
			envContent += "\n";
		}
		envContent += contractAddressLine + "\n";
		console.log("\nAdded CONTRACT_ADDRESS to .env file");
	}
	
	fs.writeFileSync(envPath, envContent);
	
	console.log("\nDeployment completed successfully!");
	console.log("CONTRACT_ADDRESS=" + contractAddress);

	if (hre.network && hre.network.name && hre.network.name !== 'hardhat' && hre.network.name !== 'localhost') {
		try {
			console.log("\nStarting background verification on block explorer...");
			const { spawn } = require('child_process');
			const cmd = 'npx';
			const args = ['hardhat', 'verify', '--network', hre.network.name, contractAddress];
			const child = spawn(cmd, args, { detached: true, stdio: 'ignore', shell: true, cwd: path.join(__dirname, '..') });
			child.unref();
			console.log('Verification launched in background (detached).');
			console.log('You can check the block explorer or run: npx hardhat verify --network ' + hre.network.name + ' ' + contractAddress);
		} catch (bgErr) {
			console.warn('Failed to launch background verification:', bgErr && bgErr.message ? bgErr.message : bgErr);
			console.log('You can retry verification manually:');
			console.log('npx hardhat verify --network ' + hre.network.name + ' ' + contractAddress);
		}
	}

	return contractAddress;
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
	console.error("Deployment failed:");
	console.error(error);
	process.exit(1);
	});
