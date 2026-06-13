import { NextResponse } from "next/server";
import { walletsApi, faucetApi, listFaucetTokens } from "@/lib/caw";

// GET /api/wallet/debug - Debug wallet and TSS node status
export async function GET() {
  try {
    const walletUuid = "0fbb78f1-62eb-4309-8f2d-0bb7295c93d9";

    console.log("[/api/wallet/debug] Checking wallet:", walletUuid);

    // Check wallet status
    let walletStatus = "unknown";
    try {
      const wallet = await walletsApi.getWallet(walletUuid);
      walletStatus = wallet.data.result.status;
      console.log("[/api/wallet/debug] Wallet status:", walletStatus);
    } catch (e: any) {
      console.error("[/api/wallet/debug] getWallet error:", e?.response?.data || e?.message);
    }

    // Check TSS node status
    let nodeStatus = "unknown";
    try {
      const node = await walletsApi.getWalletNodeStatus(walletUuid);
      nodeStatus = JSON.stringify(node.data.result);
      console.log("[/api/wallet/debug] Node status:", nodeStatus);
    } catch (e: any) {
      console.error("[/api/wallet/debug] getNodeStatus error:", e?.response?.data || e?.message);
    }

    // Check faucet tokens
    let faucetTokens = [];
    try {
      const tokens = await listFaucetTokens();
      faucetTokens = tokens.result || [];
      console.log("[/api/wallet/debug] Faucet tokens:", faucetTokens.length);
    } catch (e: any) {
      console.error("[/api/wallet/debug] faucet error:", e?.response?.data || e?.message);
    }

    return NextResponse.json({
      success: true,
      walletUuid,
      walletStatus,
      nodeStatus,
      faucetTokensCount: faucetTokens.length,
      config: {
        apiUrl: process.env.AGENT_WALLET_API_URL,
        mainNodeId: process.env.AGENT_MAIN_NODE_ID,
        hasApiKey: !!process.env.AGENT_WALLET_API_KEY,
      },
    });
  } catch (error: any) {
    console.error("[/api/wallet/debug] Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
