import { NextRequest, NextResponse } from "next/server";
import { transferTokens } from "@/lib/caw";

// POST /api/wallet/transfer - Transfer tokens
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenId, dstAddr, amount, requestId } = body;

    console.log("[/api/wallet/transfer] Request:", { tokenId, dstAddr, amount });

    if (!tokenId || !dstAddr || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: tokenId, dstAddr, amount" },
        { status: 400 }
      );
    }

    const result = await transferTokens({ tokenId, dstAddr, amount, requestId });
    console.log("[/api/wallet/transfer] Success:", JSON.stringify(result).slice(0, 200));

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("[/api/wallet/transfer] Error:");
    console.error("  Status:", error?.response?.status);
    console.error("  Data:", JSON.stringify(error?.response?.data, null, 2));
    console.error("  Message:", error?.message);

    return NextResponse.json(
      {
        success: false,
        error: error?.response?.data?.message || error?.response?.data?.error?.reason || error?.message || "Unknown error",
        details: error?.response?.data,
      },
      { status: error?.response?.status || 500 }
    );
  }
}
