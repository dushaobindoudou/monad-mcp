# Monad Testnet MCP (WIP)

This is a Model Context Protocol (MCP) server that provides tools for interacting with the Monad testnet.

## Features

This MCP provides the following tools:

1. **get-monad-balance** - Get MON balance for an Monad address on Monad testnet
2. **get-latest-block** - Get information about the latest block on Monad testnet
3. **get-transaction** - Get information about a transaction on Monad testnet
4. **get-gas-price** - Get current gas price on Monad testnet
5. **get-erc20-balance** - Get ERC20 token balance for an address on Monad testnet

## Installation

Clone the repository:

```bash
git clone https://github.com/monad-developers/monad-mcp.git
```

cd into the repository:

```bash
cd monad-mcp
```

Install dependencies:

```bash
npm install
```

This project skips the build step and uses `tsx` to run the script. Make sure to install `tsx` globally:

```bash
npm install -g tsx
```

### Claude Desktop Configuration

1. To open the configuration file, open Claude Desktop and click on Claude on the taskbar.
2. Then, click on the `Settings...` option.
3. Then click on the `Developer` tab and click `Edit Config`.
4. Open the config file with your favorite text editor and add the following configuration:

Do not forget to replace `/PATH/TO/FOLDER` with the actual path to the folder containing the build directory.

```json
{
  "mcpServers": {
    "monad-testnet": {
      "command": "tsx",
      "args": ["/PATH/TO/FOLDER/src/index.ts"]
    }
  }
}
```

## Usage

You can use this MCP with any MCP client. For example, with Claude:

```
I need to check the MON balance of address 0x742d35Cc6634C0532925a3b844Bc454e4438f44e on Monad testnet.
```

Or to get information about a transaction:

```
Can you tell me about this transaction on Monad: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

## Customization

You can modify the RPC URL in `src/index.ts` if you want to use a different provider:

```typescript
const MONAD_RPC_URL = "https://rpc.monad.xyz";
```

For better reliability, consider using an RPC provider like Alchemy or QuickNode by replacing the URL with your own endpoint.

## License

MIT
