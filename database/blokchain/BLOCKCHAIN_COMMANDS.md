# Blockchain Module - Commands Reference

## Environment Configuration

The blockchain module uses the `.env` file in this directory with the following variables:

```env
PRIVATE_KEY=<your_wallet_private_key>
WALLET_ADDRESS=<your_wallet_address>
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_MAINNET_RPC_URL=https://api.avax.network/ext/bc/C/rpc
CONTRACT_ADDRESS=<deployed_contract_address>
```

---

## Contract Compilation

Compile the smart contracts:

```bash
npm run compile
# or
npx hardhat compile
```

---

## Contract Deployment

### Deploy to Avalanche Fuji Testnet (Recommended)

```bash
npm run deploy:fuji
```

This will:
- Deploy the TournamentScores contract to Fuji testnet
- Update the `CONTRACT_ADDRESS` in the `.env` file
- Save deployment info to `deployment-info.json`

### Deploy to Local Hardhat Network (Testing)

```bash
npm run deploy:local
# or
npx hardhat run scripts/deploy.js --network hardhat
```

---

## Querying Tournament Data

### View All Tournaments

```bash
npx hardhat run scripts/query-results.js --network fuji
```

This displays:
- Total tournament count
- All tournament details (name, dates, creator)
- All player scores for each tournament
- Final rankings (if finalized)
- Links to SnowTrace explorer

### Query Specific Tournament

Use the `getPlayerScore` function on SnowTrace:

1. Go to: https://testnet.snowtrace.io/address/<CONTRACT_ADDRESS>#readContract
2. Find the `getPlayerScore` function
3. Enter:
   - `_tournamentId`: The tournament ID (e.g., `1`, `2`, `3`)
   - `_playerAddress`: The player's address (e.g., `0x0000000000000000000000000000706c617965725f30`)
   - `Block`: `latest`
4. Click "Query"

---

## Testing and Interaction

### Test Contract Interaction (Create Test Tournament)

```bash
npm run test:interact
```

This will:
- Create a test tournament on Fuji
- Record sample player scores
- Finalize the tournament

### Run Full Integration Test (Local)

```bash
npx hardhat run scripts/test-full-integration.js --network hardhat
```

Runs comprehensive tests including:
- Contract deployment
- Tournament creation
- Score recording
- Tournament finalization
- Data integrity checks

### Run Tournament Test

```bash
npx hardhat run scripts/test-tournament.js --network hardhat
```

---

## Contract Verification

Verify the deployed contract on SnowTrace:

```bash
npm run verify
# or
npx hardhat verify --network fuji <CONTRACT_ADDRESS>
```

---

## Blockchain Explorer Links

### View Contract on SnowTrace

```
https://testnet.snowtrace.io/address/<CONTRACT_ADDRESS>
```

### View Transaction

```
https://testnet.snowtrace.io/tx/<TRANSACTION_HASH>
```

### Read Contract Functions

```
https://testnet.snowtrace.io/address/<CONTRACT_ADDRESS>#readContract
```

---

## Smart Contract Functions

### Read Functions (No Gas)

- `getTournamentCount()` - Get total number of tournaments
- `getTournament(uint256 _tournamentId)` - Get tournament details
- `getPlayerScore(uint256 _tournamentId, address _playerAddress)` - Get player score
- `getTournamentPlayers(uint256 _tournamentId)` - Get all player addresses
- `getTournamentResults(uint256 _tournamentId)` - Get final rankings (if finalized)
- `verifyScoreIntegrity(uint256 _tournamentId, address _playerAddress, uint256 _expectedScore)` - Verify score

### Write Functions (Requires Gas - Owner Only)

- `createTournament(string _name, uint256 _startTime, uint256 _endTime)` - Create new tournament
- `recordScore(uint256 _tournamentId, address _playerAddress, string _playerName, uint256 _score)` - Record player score
- `finalizeTournament(uint256 _tournamentId)` - Finalize tournament

---

## Backend Integration

The backend automatically integrates with the blockchain when tournaments finish.

When a tournament completes:
1. Tournament is created on blockchain
2. All player scores are recorded
3. Tournament is finalized
4. Transaction hashes are displayed in console

Console output includes:
- Tournament blockchain ID
- Each player's score transaction hash
- Finalization transaction hash
- Final rankings verified on blockchain
- Direct links to SnowTrace

---

## Troubleshooting

### Check Wallet Balance

```bash
npx hardhat run scripts/check-balance.js --network fuji
```

### Get Fuji Testnet AVAX

Visit the Avalanche Fuji Faucet:
- https://faucet.avax.network/

### Network Issues

If you see "network does not support ENS" errors:
- This is normal for Fuji testnet (it doesn't support ENS)
- The fix is already implemented (converts user IDs to proper addresses)

### Contract Not Found

If deployment fails or contract address is wrong:
1. Check `.env` has correct `CONTRACT_ADDRESS`
2. Redeploy: `npm run deploy:fuji`
3. Verify in `deployment-info.json`

---

## Development Workflow

1. **Make changes to contracts:**
   ```bash
   # Edit contracts/TournamentScores.sol
   npm run compile
   ```

2. **Test locally:**
   ```bash
   npx hardhat run scripts/test-full-integration.js --network hardhat
   ```

3. **Deploy to Fuji:**
   ```bash
   npm run deploy:fuji
   ```

4. **Verify deployment:**
   ```bash
   npx hardhat run scripts/query-results.js --network fuji
   ```

5. **Test with backend:**
   ```bash
   cd ../../backend
   node run-real-tournament.js
   ```

---

## Directory Structure

```
database/blokchain/
├── .env                          # Environment variables
├── contracts/
│   └── TournamentScores.sol      # Smart contract
├── scripts/
│   ├── deploy.js                 # Deployment script
│   ├── interact.js               # Test interaction
│   ├── query-results.js          # Query tournament data
│   ├── test-tournament.js        # Full test
│   └── test-full-integration.js  # Integration test
├── artifacts/                    # Compiled contracts
├── deployment-info.json          # Deployment addresses
├── hardhat.config.js             # Hardhat configuration
└── package.json                  # Dependencies
```

---

## Useful NPM Scripts

```json
{
  "compile": "hardhat compile",
  "deploy:fuji": "hardhat run scripts/deploy.js --network fuji",
  "deploy:local": "hardhat run scripts/deploy.js --network hardhat",
  "test:interact": "hardhat run scripts/interact.js --network fuji",
  "verify": "hardhat verify --network fuji"
}
```

---

## Additional Resources

- **Hardhat Documentation:** https://hardhat.org/docs
- **Avalanche Documentation:** https://docs.avax.network/
- **SnowTrace (Block Explorer):** https://testnet.snowtrace.io/
- **Avalanche Fuji Faucet:** https://faucet.avax.network/

---

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file to version control
- Keep your `PRIVATE_KEY` secure
- Use testnet for development
- Only deploy to mainnet when ready for production
