import { NextResponse } from "next/server";
import { faucetApi } from "@/lib/caw";

// GET /api/wallet/faucet/tokens - List available faucet tokens
export async function GET() {
  try {
    console.log("[/api/wallet/faucet/tokens] Listing available tokens");

    const result = await faucetApi.listTokens();
    const items = result.data.result || [];

    // Parse into a flat list grouped by chain
    const tokens: Array<{
      chainId: string;
      tokenId: string;
      depositAmount: string;
      dailyLimit: string;
    }> = [];

    for (const item of items) {
      if (item.tokens) {
        for (const [tokenId, info] of Object.entries(item.tokens)) {
          tokens.push({
            chainId: item.chain_id,
            tokenId: tokenId,
            depositAmount: (info as any).deposit_amount || "0",
            dailyLimit: (info as any).daily_limit || "0",
          });
        }
      }
    }

    console.log("[/api/wallet/faucet/tokens] Found", tokens.length, "tokens");

    return NextResponse.json({
      success: true,
      tokens: tokens,
    });
  } catch (error: any) {
    console.error("[/api/wallet/faucet/tokens] Error:", error?.response?.data || error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error", tokens: [] },
      { status: 500 }
    );
  }
}
