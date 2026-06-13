import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs, getCurrentWalletUuid } from "@/lib/caw";

// GET /api/wallet/audit - Get audit logs
export async function GET(req: NextRequest) {
  try {
    const walletUuid = getCurrentWalletUuid();
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

    console.log("[/api/wallet/audit] walletUuid:", walletUuid, "limit:", limit);

    if (!walletUuid) {
      return NextResponse.json({
        success: true,
        result: { items: [] },
        message: "No wallet configured",
      });
    }

    const result = await getAuditLogs(limit, walletUuid);
    console.log("[/api/wallet/audit] result:", JSON.stringify(result).slice(0, 300));

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[/api/wallet/audit] Error:", error?.response?.data || error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error", result: { items: [] } },
      { status: 500 }
    );
  }
}
