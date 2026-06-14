import { NextRequest, NextResponse } from "next/server";
import { getPact } from "@/lib/caw";

// GET /api/wallet/pact/[pactId] - Get pact details including API key
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pactId: string }> }
) {
  try {
    const { pactId } = await params;
    console.log("[/api/wallet/pact] Getting pact:", pactId);

    const result = await getPact(pactId);
    console.log("[/api/wallet/pact] Result:", JSON.stringify(result).slice(0, 500));

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[/api/wallet/pact] Error:", error?.response?.data || error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: error?.response?.data?.message || error?.message || "Unknown error",
        details: error?.response?.data,
      },
      { status: error?.response?.status || 500 }
    );
  }
}
