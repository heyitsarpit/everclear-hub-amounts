# Standalone Round Script

This is a standalone version of the Everclear round script that works independently without the monorepo dependencies.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the environment file and fill in the required values:
```bash
cp env.example .env
```

3. Edit the `.env` file with your actual API keys and configuration.

## Usage

Run the script:
```bash
npm start
```

## Files

- `round.ts` - Main script
- `Assets.ts` - Asset data and utilities
- `Chains.ts` - Chain data and utilities
- `Address.ts` - Address utility class
- `ENV.ts` - Environment configuration
- `wagmi.ts` - Wagmi configuration
- `EverclearHubABI.ts` - Contract ABI
- `assets.json` - Asset configuration data
- `chains.json` - Chain configuration data
- `types.ts` - TypeScript type definitions

## Dependencies

The script uses the following main dependencies:
- `viem` - Ethereum library
- `wagmi` - React hooks for Ethereum
- `valibot` - Schema validation
- `bs58` - Base58 encoding
- `tronweb` - Tron integration
- `dotenv` - Environment variables
- `tsx` - TypeScript execution
