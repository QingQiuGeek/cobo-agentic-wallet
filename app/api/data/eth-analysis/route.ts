import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { resourceServer, PAYEE_ADDRESS, NETWORK } from "@/lib/x402-server";

// Mock ETH analysis data
const ETH_ANALYSIS = {
  report: "ETH Chain Analysis Report",
  timestamp: new Date().toISOString(),
  metrics: {
    gasThreshold: "12.4 Gwei",
    avgSettleSpeed: "~12.2 seconds",
    topGasContract: "Uniswap V3 Pool Router (33.1%)",
    activeAgents: 14809,
    dailyTransactions: 1247832,
    networkUtilization: "67.3%",
  },
  prediction: {
    shortTermVolatility: "2.14%",
    rsi: 54.8,
    breakoutProbability: "64%",
    direction: "BULLISH",
    pivotSupport: "$3,210.00 USD",
  },
};

const handler = async (_req: NextRequest) => {
  return NextResponse.json({
    success: true,
    data: ETH_ANALYSIS,
  });
};

export const GET = withX402(
  handler,
  {
    accepts: {
      scheme: "exact",
      price: "$0.001",
      network: NETWORK,
      payTo: PAYEE_ADDRESS,
    },
    description: "ETH Chain Analysis Report - High-density historical wallet analysis & gas patterns",
  },
  resourceServer
);
