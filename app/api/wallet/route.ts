import { NextResponse } from "next/server";
import { getCurrentWalletUuid, getWalletInfo, getBalances, listWallets } from "@/lib/caw";

// GET /api/wallet - Get wallet info and balances
export async function GET() {
  try {
    const walletUuid = getCurrentWalletUuid();
    console.log("[/api/wallet] walletUuid:", walletUuid);

    if (!walletUuid) {
      // Try to list wallets and use the first one
      try {
        const walletsResp = await listWallets();
        const wallets = walletsResp.result || [];
        if (wallets.length > 0) {
          return NextResponse.json({
            success: true,
            connected: true,
            wallet: { uuid: wallets[0].uuid, name: wallets[0].name },
          });
        }
      } catch (e: any) {
        console.error("[/api/wallet] listWallets error:", e?.response?.data || e?.message || e);
      }
      return NextResponse.json({
        success: true,
        connected: false,
        message: "No wallet configured",
      });
    }

    const [walletInfo, balances] = await Promise.all([
      getWalletInfo(walletUuid).catch(e => {
        console.error("[/api/wallet] getWalletInfo error:", e?.response?.data || e?.message || e);
        return { result: null };
      }),
      getBalances(walletUuid).catch(e => {
        console.error("[/api/wallet] getBalances error:", e?.response?.data || e?.message || e);
        return { result: [] };
      }),
    ]);

    return NextResponse.json({
      success: true,
      connected: !!walletInfo.result,
      wallet: walletInfo.result,
      balances: balances.result,
    });
  } catch (error: any) {
    console.error("[/api/wallet] Unexpected error:", error?.response?.data || error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
