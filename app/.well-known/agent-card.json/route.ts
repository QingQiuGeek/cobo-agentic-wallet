import { NextResponse } from "next/server";

// GET /.well-known/agent-card.json - A2A Agent Discovery Card
export async function GET() {
  const agentCard = {
    name: "CoboAgent",
    description:
      "AI agent with x402 payment capabilities and CAW wallet. Can discover and pay for on-chain data services, manage wallet assets, and register on ERC-8004.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    version: "1.0.0",
    capabilities: {
      streaming: true,
      pushNotifications: false,
    },
    skills: [
      {
        id: "eth-analysis",
        name: "ETH Chain Analysis",
        description: "Paid ETH on-chain analysis report via x402",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Analysis query" },
          },
        },
      },
      {
        id: "market-prediction",
        name: "Market Prediction",
        description: "Statistical price boundaries & sentiment insights",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Market query" },
          },
        },
      },
      {
        id: "wallet-management",
        name: "Wallet Management",
        description: "Query balances, transfer tokens, manage CAW wallet",
        inputSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["balance", "transfer", "history"],
            },
          },
        },
      },
    ],
    provider: {
      organization: "Cobo Agentic Wallet",
      url: "https://www.cobo.com/products/agentic-wallet",
    },
    authentication: {
      schemes: ["x402"],
    },
  };

  return NextResponse.json(agentCard, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
