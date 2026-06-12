import { NextRequest, NextResponse } from "next/server";
import { contractCall } from "@/lib/caw";

// POST /api/wallet/contract-call - Call a smart contract
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chainId, contractAddr, calldata, value, requestId } = body;

    if (!chainId || !contractAddr || !calldata) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: chainId, contractAddr, calldata" },
        { status: 400 }
      );
    }

    const result = await contractCall({ chainId, contractAddr, calldata, value, requestId });

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
