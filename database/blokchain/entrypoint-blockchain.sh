#!/bin/sh

echo "Compiling smart contracts..."
npm run compile

if [ $? -eq 0 ]; then
	echo "Contracts compiled successfully"
else
	echo "Contract compilation failed"
	exit 1
fi

echo ""
echo "Deploying smart contract..."
if [ "$NETWORK" = "local" ] || [ "$RUN_LOCAL_NODE" = "true" ]; then
	npm run deploy:local
else
	npm run deploy:fuji
fi

if [ $? -eq 0 ]; then
	echo "Contract deployed successfully"
	if [ -f .env ]; then
		export $(grep -v '^#' .env | xargs)
	fi
else
	echo "Contract deployment failed (continuing anyway)"
fi

echo ""
echo "Blockchain Configuration:"
echo "Network: ${NETWORK:-fuji}"
echo "Chain ID: ${CHAIN_ID:-43113}"
if [ -n "$CONTRACT_ADDRESS" ]; then
	echo "Contract: $CONTRACT_ADDRESS"
	echo "Explorer: https://testnet.snowtrace.io/address/$CONTRACT_ADDRESS"
else
	echo "CONTRACT_ADDRESS not set - deploy contract first"
fi
echo ""

if [ "$RUN_LOCAL_NODE" = "true" ]; then
	echo "Starting local Hardhat node..."
	npx hardhat node
else
	echo "Connecting to Avalanche Fuji testnet"
	echo "RPC: ${AVALANCHE_FUJI_RPC_URL:-https://api.avax-test.network/ext/bc/C/rpc}"
	echo ""
	echo "Blockchain service ready"
	echo "Use 'npm run deploy:fuji' to deploy contracts"
	echo "Use 'npm run test:interact' to test the contract"
	echo "Use 'npx hardhat run scripts/query-results.js --network fuji' to view data"
	echo ""
	echo "Service will stay running. Press Ctrl+C to stop."
	
	tail -f /dev/null
fi
