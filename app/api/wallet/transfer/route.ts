import { NextRequest, NextResponse } from "next/server";
import { transferTokens } from "@/lib/caw";

// POST /api/wallet/transfer - Transfer tokens
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenId, dstAddr, amount, requestId } = body;

    if (!tokenId || !dstAddr || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: tokenId, dstAddr, amount" },
        { status: 400 }
      );
    }

    const result = await transferTokens({ tokenId, dstAddr, amount, requestId });

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
