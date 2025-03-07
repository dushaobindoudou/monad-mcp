import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createPublicClient, formatUnits, getContract, http, stringify } from "viem";
import {  monadTestnet } from "./constants.js";

const server = new McpServer({
  name: "monad-testnet",
  version: "0.0.1",
});

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

server.tool(
  "get-mon-balance",
  "Get MON balance for an address on Monad testnet",
  {
    address: z.string().describe("Monad testnet address to check balance for"),
  },
  async ({ address }) => {
    try {
      const balance = await publicClient.getBalance({
        address: address as `0x${string}`,
      });

      return {
        content: [
          {
            type: "text",
            text: `Balance for ${address}: ${balance.toString()} MON`,
          },
        ],
      };
    } catch (error) {
      console.error("Error getting balance:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve balance for address: ${address}. Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-latest-block",
  "Get information about the latest block on Monad testnet",
  {},
  async () => {
    try {
      const block = await publicClient.getBlock();

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
            text: stringify(block, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error getting latest block:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve latest block information. Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-transaction",
  "Get information about a transaction on Monad testnet",
  {
    txHash: z.string().describe("Transaction hash to look up"),
  },
  async ({ txHash }) => {
    try {
      const tx = await publicClient.getTransaction({
        hash: txHash as `0x${string}`,
      });

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
            text: stringify(tx, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error getting transaction:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to retrieve transaction information for hash: ${txHash}. Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-erc20-balance",
  "Get ERC20 token balance for an address on Monad testnet",
  {
    tokenAddress: z.string().describe("ERC20 token contract address"),
    walletAddress: z.string().describe("Wallet address to check balance for"),
  },
  async ({ tokenAddress, walletAddress }) => {
    try {
      // ERC20 standard balanceOf ABI
      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
        "function name() view returns (string)",
      ];

      const contract = getContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        client: publicClient,
      });

      const [balance, decimals, symbol, name] = await Promise.all([
        contract.read.balanceOf([walletAddress]),
        contract.read.decimals(),
        contract.read.symbol(),
        contract.read.name(),
      ]);

      const formattedBalance = formatUnits(balance as bigint, decimals as number);

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
            text: `Failed to retrieve ERC20 token balance. Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Monad testnet MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
