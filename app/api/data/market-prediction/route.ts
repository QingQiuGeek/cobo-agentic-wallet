import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { resourceServer, PAYEE_ADDRESS, NETWORK } from "@/lib/x402-server";

// Mock market prediction data
const MARKET_PREDICTION = {
  report: "Alpha Oracle Market Prediction",
  timestamp: new Date().toISOString(),
  sentiment: {
    shortTermVolatility: "2.14%",
    rsi: 54.8,
    breakoutProbability12h: "64%",
    consensusDirection: "BULLISH",
    pivotSupport: "$3,210.00 USD",
    pivotResistance: "$3,450.00 USD",
  },
  signals: [
    { indicator: "MACD", signal: "BUY", strength: 0.72 },
    { indicator: "Bollinger Bands", signal: "NEUTRAL", strength: 0.45 },
    { indicator: "Volume Profile", signal: "ACCUMULATION", strength: 0.68 },
  ],
  recommendation: "Consider accumulating ETH at current levels with stop-loss at $3,150",
};

const handler = async (_req: NextRequest) => {
  return NextResponse.json({
    success: true,
    data: MARKET_PREDICTION,
  });
};

export const GET = withX402(
  handler,
  {
    accepts: {
      scheme: "exact",
      price: "$0.005",
      network: NETWORK,
      payTo: PAYEE_ADDRESS,
    },
    description: "Market Prediction - Statistical price boundaries & sentiment insights",
  },
  resourceServer
);
