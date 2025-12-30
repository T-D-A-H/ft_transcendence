# Blockchain Commands

Common commands for blockchain operations.

## Setup

### Install Dependencies
```powershell
```bash
cd database/blokchain
npm install
cp .env.example .env
```

## Compilation Contracts
```powershell
npm run compile
```

Alternative:
```powershell
npx hardhat compile
```

### Clean Build Artifacts
```powershell
npx hardhat clean
```

```bash
npm run compile
# or
npx hardhat compile
Deploy to Fuji:
```bash
npm run deploy:fuji
```

Verify contract:
```bash
npx hardhat verify --network fuji "[contract ID]"
```

## Testing

Run interaction test:
```bash
npm run test:interact
```

Query tournament results:
```bash
npx hardhat run scripts/query-results.js --network fuji
```

Check wallet balance:
```bash
node -e "require('dotenv').config(); const ethers = require('ethers'); (async () => { const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_FUJI_RPC_URL); const balance = await provider.getBalance(process.env.WALLET_ADDRESS); console.log('Balance:', ethers.formatEther(balance), 'AVAX'); })()"
```

## Backend Usage

```javascript
const blockchainService = require('./backend/src/BlockchainService');

await blockchainService.initialize();

// this is to create a test tournament || need to make it use real data
const tournamentId = await blockchainService.createTournament(
  "Championship 2025",
  Math.floor(Date.now() / 1000),
  Math.floor(Date.now() / 1000) + 86400 // 7 days maximum
);

await blockchainService.recordScore(tournamentId, playerAddress, playerName, score);

await blockchainService.finalizeTournament(tournamentId);

const results = await blockchainService.getTournamentResults(tournamentId);
```

## Debugging

```bash
npx hardhat console --network fuji
npx hardhat clean
npx hardhat node  # local node
```

## Links
- Fuji Explorer: https://testnet.snowtrace.io/
- Faucet: https://faucet.avax.network/
- Contract: https://testnet.snowtrace.io/address/0x17816A8DE2032b580c5030855c2Be639eB09a5eF
- Network status: https://status.avax.network/

## Troubleshooting
**Insufficient funds**: Get AVAX from https://faucet.avax.network/
**Contract not found**: Run `npm run compile`
**Invalid private key**: Check .env file (64 hex chars, no 0x prefix)
**Network error**: Try alternative RPC: https://rpc.ankr.com/avalanche_fuji