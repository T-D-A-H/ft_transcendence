#!/usr/bin/env node
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function usage() {
  console.error('Usage: node scripts/inspectContract.js <address> [--key=APIKEY] [--network=fuji|mainnet] [--json]');
  process.exit(1);
}

const argv = process.argv.slice(2);
if (argv.length === 0) usage();
const address = argv[0];
const cliKeyArg = argv.find(a => a.startsWith('--key='));
const apiKey = cliKeyArg ? cliKeyArg.split('=')[1] : (process.env.SNOWTRACE_API_KEY || process.env.SNOWTRACE_APIKEY || process.env.SNOWTRACE_KEY);
const network = (argv.find(a => a.startsWith('--network=')) || '--network=fuji').split('=')[1] || 'fuji';
const outputJson = argv.includes('--json');

const base = network === 'mainnet' ? 'https://api.snowtrace.io' : 'https://api-testnet.snowtrace.io';
const url = `${base}/api?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey || ''}`;

(async () => {
  try {
    const res = await axios.get(url);
    if (!res.data) {
      console.error('No response from Snowtrace');
      process.exit(1);
    }
    if (res.data.status === '0' && res.data.message) {
      console.error('Snowtrace response:', res.data.message);
      if (res.data.result) console.error(res.data.result);
      process.exit(1);
    }
    const info = Array.isArray(res.data.result) ? res.data.result[0] : res.data.result;
    if (outputJson) {
      console.log(JSON.stringify(info, null, 2));
      return;
    }

    console.log('Contract Name:', info.ContractName || '—');
    console.log('Compiler:', info.CompilerVersion || '—');
    console.log('License:', info.LicenseType || '—');
    console.log('Proxy:', info.Proxy || '—');
    console.log('Swarm Source:', info.SwarmSource ? 'present' : 'none');
    console.log('---');

    if (info.SourceCode) {
      console.log('Source code available — first 400 chars:');
      const snippet = info.SourceCode.replace(/\r/g, '').slice(0, 400);
      console.log(snippet);
      console.log('---');
    } else {
      console.log('No source code available.');
    }

    const abiRaw = info.ABI;
    if (!abiRaw || abiRaw === 'Contract source code not verified') {
      console.log('ABI not available or contract not verified.');
      process.exit(0);
    }

    let abi;
    try {
      abi = JSON.parse(abiRaw);
    } catch (e) {
      try {
        // sometimes ABI is wrapped/escaped; try to unescape
        const cleaned = abiRaw.replace(/\\"/g, '"');
        abi = JSON.parse(cleaned);
      } catch (e2) {
        console.error('Failed to parse ABI:', e2.message);
        console.log('Raw ABI (truncated):', abiRaw.slice(0, 200));
        process.exit(1);
      }
    }

    const functions = (abi || []).filter(x => x.type === 'function');
    const events = (abi || []).filter(x => x.type === 'event');

    console.log(`Functions: ${functions.length}`);
    functions.forEach(fn => {
      const inputs = (fn.inputs || []).map(i => `${i.type}${i.name ? ' ' + i.name : ''}`).join(', ');
      const outputs = (fn.outputs || []).map(o => o.type).join(', ');
      console.log(` - ${fn.name}(${inputs}) → ${outputs || '-'} [${fn.stateMutability || fn.constant || ''}]`);
    });

    console.log(`Events: ${events.length}`);
    events.forEach(ev => {
      const inputs = (ev.inputs || []).map(i => `${i.type}${i.name ? ' ' + i.name : ''}${i.indexed ? ' indexed' : ''}`).join(', ');
      console.log(` - ${ev.name}(${inputs})`);
    });

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
