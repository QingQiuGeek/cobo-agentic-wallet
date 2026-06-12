import { NextRequest, NextResponse } from "next/server";
import { requestFaucetTokens, listFaucetTokens } from "@/lib/caw";

// POST /api/wallet/faucet - Request testnet tokens
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenId, address } = body;

    if (!tokenId || !address) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: tokenId, address" },
        { status: 400 }
      );
    }

    const result = await requestFaucetTokens(tokenId, address);

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// GET /api/wallet/faucet - List available faucet tokens
export async function GET() {
  try {
    const result = await listFaucetTokens();
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
