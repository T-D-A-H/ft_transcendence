require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
	solidity: {
		version: "0.8.28",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200
			}
		}
	},
	networks: {
		fuji: {
			url: process.env.AVALANCHE_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
			chainId: 43113,
			accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
			gasPrice: "auto",
			gas: "auto"
		},
		avalanche: {
			url: process.env.AVALANCHE_MAINNET_RPC_URL || "https://api.avax.network/ext/bc/C/rpc",
			chainId: 43114,
			accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
			gasPrice: "auto",
			gas: "auto"
		},
		hardhat: {
			chainId: 31337
		}
	},
	paths: {
		sources: "./contracts",
		tests: "./test",
		cache: "./cache",
		artifacts: "./artifacts"
	},
	mocha: {
		timeout: 40000
	},
	etherscan: {
		apiKey: {
			avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY || "abc"
		},
		customChains: [
			{
				network: "avalancheFujiTestnet",
				chainId: 43113,
				urls: {
					apiURL: "https://api-testnet.snowtrace.io/api",
					browserURL: "https://testnet.snowtrace.io"
				}
			}
		]
	},
	sourcify: {
		enabled: false
	}
};
