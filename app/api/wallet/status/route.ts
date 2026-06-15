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

    // Deduplicate balances: combine entries that display as the same symbol (e.g. ETH + SETH → ETH)
    const getTokenSymbol = (tokenId: string) => {
      if (tokenId.includes('USDC')) return 'USDC';
      if (tokenId.includes('USDT')) return 'USDT';
      if (tokenId.includes('ETH')) return 'ETH';
      if (tokenId.includes('SOL')) return 'SOL';
      return tokenId;
    };
    const balanceMap = new Map<string, { token: string; amount: number; chain: string }>();
    for (const b of balanceItems) {
      const tokenId = b.token_id || b.token || '';
      const symbol = getTokenSymbol(tokenId);
      const amount = parseFloat(b.amount || b.balance || '0');
      const chain = b.chain_id || b.chain || '';
      if (balanceMap.has(symbol)) {
        balanceMap.get(symbol)!.amount += amount;
      } else {
        balanceMap.set(symbol, { token: tokenId, amount, chain });
      }
    }
    const dedupedBalances = Array.from(balanceMap.values()).map((b) => ({
      token: b.token,
      amount: String(b.amount),
      chain: b.chain,
    }));

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
      balances: dedupedBalances,
    });
  } catch (error: any) {
    console.error("[/api/wallet/status] Unexpected error:", error?.response?.data || error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
