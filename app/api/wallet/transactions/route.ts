import { NextRequest, NextResponse } from "next/server";
import { getTransactionRecords } from "@/lib/caw";

// GET /api/wallet/transactions - Get transaction records
export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");
    const result = await getTransactionRecords(limit);

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
