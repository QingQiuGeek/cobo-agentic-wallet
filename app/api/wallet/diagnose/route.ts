import { NextResponse } from "next/server";
import { walletsApi } from "@/lib/caw";

// GET /api/wallet/diagnose - Simple wallet and node diagnostics
export async function GET() {
  try {
    const results: any = { config: {
      apiUrl: process.env.AGENT_WALLET_API_URL,
      mainNodeId: process.env.AGENT_MAIN_NODE_ID,
      hasApiKey: !!process.env.AGENT_WALLET_API_KEY,
    }};

    // List wallets
    try {
      const walletsResp = await walletsApi.listWallets();
      results.wallets = walletsResp.data.result;
    } catch (e: any) {
      results.walletsError = e?.response?.data?.message || e?.message;
    }

    // If we have wallets, check the first one's node status
    if (results.wallets?.length > 0) {
      const wallet = results.wallets[0];

      try {
        const walletResp = await walletsApi.getWallet(wallet.uuid);
        results.walletDetails = walletResp.data.result;
      } catch (e: any) {
        results.walletDetailsError = e?.response?.data?.message || e?.message;
      }

      try {
        const nodeResp = await walletsApi.getWalletNodeStatus(wallet.uuid);
        results.nodeStatus = nodeResp.data.result;
      } catch (e: any) {
        results.nodeStatusError = e?.response?.data?.message || e?.message;
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({
      error: error?.response?.data?.message || error?.message,
      stack: error?.stack?.split('\n').slice(0, 5),
    }, { status: 500 });
  }
}
