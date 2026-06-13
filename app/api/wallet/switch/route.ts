import { NextRequest, NextResponse } from "next/server";
import { setCurrentWalletUuid, getWalletInfo, getBalances, listWalletAddresses } from "@/lib/caw";

// POST /api/wallet/switch - Switch current wallet
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletUuid } = body;

    if (!walletUuid) {
      return NextResponse.json(
        { success: false, error: "Missing required field: walletUuid" },
        { status: 400 }
      );
    }

    // Verify wallet exists
    const walletInfo = await getWalletInfo(walletUuid);
    if (!walletInfo.result) {
      return NextResponse.json(
        { success: false, error: "Wallet not found" },
        { status: 404 }
      );
    }

    // Switch to new wallet
    setCurrentWalletUuid(walletUuid);

    // Get new wallet info
    const [balances, addresses] = await Promise.all([
      getBalances(walletUuid),
      listWalletAddresses(walletUuid),
    ]);

    return NextResponse.json({
      success: true,
      wallet: {
        uuid: walletInfo.result.uuid,
        name: walletInfo.result.name,
        status: walletInfo.result.status,
        address: addresses.result?.[0]?.address || "",
      },
      balances: balances.result || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
