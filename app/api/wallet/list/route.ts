import { NextResponse } from "next/server";
import { listWallets, listWalletAddresses } from "@/lib/caw";

// GET /api/wallet/list - List all wallets
export async function GET() {
  try {
    const walletsResp = await listWallets();
    const wallets = walletsResp.result || [];

    // Get addresses for each wallet
    const walletsInfo = await Promise.all(
      wallets.map(async (wallet: any) => {
        try {
          const addressesResp = await listWalletAddresses(wallet.uuid);
          const addressResult = addressesResp.result as any;
          const addressItems = Array.isArray(addressResult)
            ? addressResult
            : addressResult?.items || [];
          // Separate EVM and Solana addresses
          const evmAddress = addressItems.find((a: any) => a.address?.startsWith('0x'))?.address || "";
          const solAddress = addressItems.find((a: any) => !a.address?.startsWith('0x'))?.address || "";
          return {
            uuid: wallet.uuid,
            name: wallet.name,
            status: wallet.status,
            evmAddress,
            solAddress,
          };
        } catch {
          return {
            uuid: wallet.uuid,
            name: wallet.name,
            status: wallet.status,
            address: "",
            chain: "",
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      wallets: walletsInfo,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
