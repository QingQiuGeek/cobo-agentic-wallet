import { NextRequest, NextResponse } from "next/server";
import { getTransactionRecords, getCurrentWalletUuid } from "@/lib/caw";

// GET /api/wallet/transactions - Get transaction records
export async function GET(req: NextRequest) {
  try {
    const walletUuid = getCurrentWalletUuid();
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

    console.log("[/api/wallet/transactions] walletUuid:", walletUuid, "limit:", limit);

    if (!walletUuid) {
      return NextResponse.json({
        success: true,
        result: [],
        message: "No wallet configured",
      });
    }

    const result = await getTransactionRecords(limit, walletUuid);
    console.log("[/api/wallet/transactions] result:", JSON.stringify(result).slice(0, 300));

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[/api/wallet/transactions] Error:", error?.response?.data || error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error", result: [] },
      { status: 500 }
    );
  }
}
