# Ethereum Sepolia MCP

This is a Model Context Protocol (MCP) server that provides tools for interacting with the Ethereum Sepolia testnet.

## Features

This MCP provides the following tools:

1. **get-eth-balance** - Get ETH balance for an Ethereum address on Sepolia testnet
2. **get-latest-block** - Get information about the latest block on Sepolia testnet
3. **get-transaction** - Get information about a transaction on Sepolia testnet
4. **get-gas-price** - Get current gas price on Sepolia testnet
5. **get-erc20-balance** - Get ERC20 token balance for an address on Sepolia testnet

## Installation

```bash
npm install
npm run build
```

## Usage

You can use this MCP with any MCP client. For example, with Claude:

```
I need to check the ETH balance of address 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on Sepolia testnet.
```

Or to get information about a transaction:

```
Can you tell me about this transaction on Sepolia: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

## Customization

You can modify the RPC URL in `src/index.ts` if you want to use a different provider:

```typescript
const SEPOLIA_RPC_URL = "https://rpc.sepolia.org";
```

For better reliability, consider using an RPC provider like Infura, Alchemy, or QuickNode by replacing the URL with your own endpoint.

## Adding More Tools

You can extend this MCP by adding more tools to interact with Ethereum. Some ideas:

- Tool to deploy a smart contract
- Tool to interact with specific smart contracts
- Tool to monitor pending transactions
- Tool to estimate gas for a transaction

## License

ISC 