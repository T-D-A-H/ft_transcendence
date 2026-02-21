#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { ethers } = require('ethers');

function usage() {
  console.error('Usage: node scripts/getTournamentResults.js <tournamentId> [--address=0x..] [--rpc=URL] [--block=latest|<number>] [--json]');
  process.exit(1);
}

const argv = process.argv.slice(2);
if (argv.length === 0) usage();
const tournamentId = argv[0];
const addressArg = argv.find(a => a.startsWith('--address='));
const rpcArg = argv.find(a => a.startsWith('--rpc='));
const blockArg = argv.find(a => a.startsWith('--block='));
const outputJson = argv.includes('--json');

const contractAddress = addressArg ? addressArg.split('=')[1] : process.env.CONTRACT_ADDRESS;
if (!contractAddress) {
  console.error('Contract address not provided and CONTRACT_ADDRESS not set in .env');
  process.exit(1);
}

const rpcUrl = rpcArg ? rpcArg.split('=')[1] : (process.env.AVALANCHE_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc');
const provider = new ethers.JsonRpcProvider(rpcUrl);

// Load ABI from build artifact
const buildPath = path.join(__dirname, '..', 'build', 'contracts', 'TournamentScores.json');
if (!fs.existsSync(buildPath)) {
  console.error('ABI build file not found at', buildPath);
  process.exit(1);
}
const artifact = JSON.parse(fs.readFileSync(buildPath, 'utf8'));
const abi = artifact.abi;
const contract = new ethers.Contract(contractAddress, abi, provider);

(async () => {
  try {
    const blockTag = blockArg ? blockArg.split('=')[1] : 'latest';
    const blockTagValue = blockTag === 'latest' ? 'latest' : parseInt(blockTag, 10);

    // Use low-level provider.call so we can specify block tag
    const data = contract.interface.encodeFunctionData('getTournamentResults', [ethers.toBigInt(tournamentId)]);
    const callResult = await provider.call({ to: contractAddress, data }, blockTagValue);
    const decoded = contract.interface.decodeFunctionResult('getTournamentResults', callResult);

    const players = decoded[0] || [];
    const scores = decoded[1] || [];
    const finalizedAt = decoded[2] ? decoded[2].toString() : null;

    if (outputJson) {
      console.log(JSON.stringify({ tournamentId: tournamentId.toString(), block: blockTag, players, scores: scores.map(s => s.toString()), finalizedAt }, null, 2));
      return;
    }

    console.log(`Tournament ID: ${tournamentId}`);
    console.log(`Block: ${blockTag}`);
    console.log(`Players: ${players.length}`);
    console.log('---');
    for (let i = 0; i < players.length; i++) {
      console.log(`${i + 1}. ${players[i]} - ${scores[i] ? scores[i].toString() : '0'}`);
    }
    if (finalizedAt) console.log('\nFinalized At (timestamp):', finalizedAt);

  } catch (err) {
    console.error('Query error:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
