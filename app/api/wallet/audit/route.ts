import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/caw";

// GET /api/wallet/audit - Get audit logs
export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");
    const result = await getAuditLogs(limit);

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
