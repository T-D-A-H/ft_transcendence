
pragma solidity ^0.8.28;

import { avalancheFuji } from "@avalanche-sdk/interchain/chains";
import { dispatch } from "@avalanche-sdk/interchain/chains";

interface ChainConfig {
  id: number;
  name: string;
  network: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: {
    default: {
      http: string[];
    };
  };
  blockchainId: string;
  interchainContracts: {
    teleporterRegistry: Address;
    teleporterManager: Address;
  };
}