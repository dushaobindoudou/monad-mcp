import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ethers } from "ethers";

// Sepolia testnet RPC URL - you can replace this with your own provider URL
const SEPOLIA_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/h3KXY5AhC0kqn5_KWk2foLlsVsU6-Hh8";

// Create server instance
const server = new McpServer({
  name: "ethereum-sepolia",
  version: "1.0.0",
});

// Initialize Ethereum provider
let provider: ethers.JsonRpcProvider;

// Helper function to ensure provider is initialized
function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  }
  return provider;
}

// Helper function to format Ether values
function formatEther(wei: bigint): string {
  return ethers.formatEther(wei);
}

// Helper function to format transaction data
function formatTransaction(tx: ethers.TransactionResponse): string {
  return [
    `Transaction Hash: ${tx.hash}`,
    `From: ${tx.from}`,
    `To: ${tx.to || 'Contract Creation'}`,
    `Value: ${formatEther(tx.value)} ETH`,
    `Gas Price: ${tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : 'Unknown'} Gwei`,
    `Nonce: ${tx.nonce}`,
    `Block Number: ${tx.blockNumber || 'Pending'}`,
    `Block Hash: ${tx.blockHash || 'Pending'}`,
    `Transaction Index: ${tx.index !== undefined ? tx.index : 'Pending'}`,
  ].join('\n');
}

// Helper function to format block data
function formatBlock(block: ethers.Block): string {
  return [
    `Block Number: ${block.number}`,
    `Block Hash: ${block.hash}`,
    `Timestamp: ${new Date(Number(block.timestamp) * 1000).toISOString()}`,
    `Miner: ${block.miner}`,
    `Gas Limit: ${block.gasLimit.toString()}`,
    `Gas Used: ${block.gasUsed.toString()}`,
    `Transaction Count: ${block.transactions.length}`,
    `Parent Hash: ${block.parentHash}`,
  ].join('\n');
}

// Register Ethereum Sepolia tools
server.tool(
  "get-eth-balance",
  "Get ETH balance for an Ethereum address on Sepolia testnet",
  {
    address: z.string().describe("Ethereum address to check balance for"),
  },
  async ({ address }) => {
    try {
      const provider = getProvider();
      const balance = await provider.getBalance(address);
      
      return {
        content: [
          {
            type: "text",
            text: `Balance for ${address}: ${formatEther(balance)} ETH`,
          },
        ],
      };
    } catch (error) {
      console.error("Error getting balance:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve balance for address: ${address}. Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-latest-block",
  "Get information about the latest block on Sepolia testnet",
  {},
  async () => {
    try {
      const provider = getProvider();
      const block = await provider.getBlock("latest");
      
      if (!block) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to retrieve latest block information",
            },
          ],
        };
      }
      
      return {
        content: [
          {
            type: "text",
            text: formatBlock(block),
          },
        ],
      };
    } catch (error) {
      console.error("Error getting latest block:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve latest block information. Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-transaction",
  "Get information about a transaction on Sepolia testnet",
  {
    txHash: z.string().describe("Transaction hash to look up"),
  },
  async ({ txHash }) => {
    try {
      const provider = getProvider();
      const tx = await provider.getTransaction(txHash);
      
      if (!tx) {
        return {
          content: [
            {
              type: "text",
              text: `Transaction not found: ${txHash}`,
            },
          ],
        };
      }
      
      return {
        content: [
          {
            type: "text",
            text: formatTransaction(tx),
          },
        ],
      };
    } catch (error) {
      console.error("Error getting transaction:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve transaction information for hash: ${txHash}. Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-gas-price",
  "Get current gas price on Sepolia testnet",
  {},
  async () => {
    try {
      const provider = getProvider();
      const gasPrice = await provider.getFeeData();
      
      return {
        content: [
          {
            type: "text",
            text: [
              "Current Gas Prices on Sepolia:",
              `Gas Price: ${gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : 'Unknown'} Gwei`,
              `Max Fee Per Gas: ${gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : 'Unknown'} Gwei`,
              `Max Priority Fee Per Gas: ${gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') : 'Unknown'} Gwei`,
            ].join('\n'),
          },
        ],
      };
    } catch (error) {
      console.error("Error getting gas price:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve gas price information. Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-erc20-balance",
  "Get ERC20 token balance for an address on Sepolia testnet",
  {
    tokenAddress: z.string().describe("ERC20 token contract address"),
    walletAddress: z.string().describe("Wallet address to check balance for"),
  },
  async ({ tokenAddress, walletAddress }) => {
    try {
      const provider = getProvider();
      
      // ERC20 standard balanceOf ABI
      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
        "function name() view returns (string)"
      ];
      
      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
      
      // Get token details and balance
      const [balance, decimals, symbol, name] = await Promise.all([
        tokenContract.balanceOf(walletAddress),
        tokenContract.decimals(),
        tokenContract.symbol(),
        tokenContract.name()
      ]);
      
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      return {
        content: [
          {
            type: "text",
            text: `Token: ${name} (${symbol})\nBalance for ${walletAddress}: ${formattedBalance} ${symbol}`,
          },
        ],
      };
    } catch (error) {
      console.error("Error getting ERC20 balance:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve ERC20 token balance. Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Ethereum Sepolia MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
