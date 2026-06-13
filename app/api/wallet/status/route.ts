import { NextResponse } from "next/server";
import { getCurrentWalletUuid, getWalletInfo, getBalances, listWalletAddresses } from "@/lib/caw";

// GET /api/wallet/status - Get current wallet status
export async function GET() {
  try {
    const walletUuid = getCurrentWalletUuid();
    console.log("[/api/wallet/status] walletUuid:", walletUuid);

    if (!walletUuid) {
      return NextResponse.json({
        success: true,
        connected: false,
        message: "No wallet configured",
      });
    }

    const [walletInfo, balances, addresses] = await Promise.all([
      getWalletInfo(walletUuid).catch(e => {
        console.error("[/api/wallet/status] getWalletInfo error:", e?.response?.data || e?.message || e);
        return { result: null };
      }),
      getBalances(walletUuid).catch(e => {
        console.error("[/api/wallet/status] getBalances error:", e?.response?.data || e?.message || e);
        return { result: [] };
      }),
      listWalletAddresses(walletUuid).catch(e => {
        console.error("[/api/wallet/status] listWalletAddresses error:", e?.response?.data || e?.message || e);
        return { result: [] };
      }),
    ]);

    console.log("[/api/wallet/status] walletInfo:", JSON.stringify(walletInfo).slice(0, 200));
    console.log("[/api/wallet/status] balances:", JSON.stringify(balances).slice(0, 200));
    console.log("[/api/wallet/status] addresses:", JSON.stringify(addresses).slice(0, 200));

    if (!walletInfo.result) {
      return NextResponse.json({
        success: true,
        connected: false,
        message: "Wallet not found or API error",
      });
    }

    const wallet = walletInfo.result;
    const balanceResult = balances.result as any;
    const balanceItems = Array.isArray(balanceResult)
      ? balanceResult
      : balanceResult?.items || [];
    const addressResult = addresses.result as any;
    const addressItems = Array.isArray(addressResult)
      ? addressResult
      : addressResult?.items || [];

    const evmAddress = addressItems.find((a: any) => a.address?.startsWith('0x'))?.address || "";
    const solAddress = addressItems.find((a: any) => !a.address?.startsWith('0x'))?.address || "";

    return NextResponse.json({
      success: true,
      connected: true,
      wallet: {
        uuid: wallet.uuid,
        name: wallet.name,
        status: wallet.status,
        evmAddress,
        solAddress,
      },
      balances: balanceItems.map((b: any) => ({
        token: b.token_id || b.token,
        amount: b.amount || b.balance || '0',
        chain: b.chain_id || b.chain,
      })),
    });
  } catch (error: any) {
    console.error("[/api/wallet/status] Unexpected error:", error?.response?.data || error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
