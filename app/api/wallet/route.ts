import { NextResponse } from "next/server";
import {
  getWalletInfo,
  getBalances,
  listWallets,
} from "@/lib/caw";

// GET /api/wallet - Get wallet info and balances
export async function GET() {
  try {
    const [walletInfo, balances] = await Promise.all([
      getWalletInfo(),
      getBalances(),
    ]);

    return NextResponse.json({
      success: true,
      wallet: walletInfo,
      balances: balances,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
