import { NextRequest, NextResponse } from "next/server";
import { registerAgent } from "@/lib/erc8004";
import { getCurrentWalletUuid, listWalletAddresses } from "@/lib/caw";

// POST /api/wallet/register - Register agent on ERC-8004
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name = "CoboAgent", description = "AI Agent with x402 payment capabilities" } = body;

    const walletUuid = getCurrentWalletUuid();
    if (!walletUuid) {
      return NextResponse.json(
        { success: false, error: "No wallet connected" },
        { status: 400 }
      );
    }

    // Get wallet address
    const addressesResp = await listWalletAddresses(walletUuid);
    const addrResult = addressesResp.result as any;
    const addressList = Array.isArray(addrResult) ? addrResult : addrResult?.items || [];
    const walletAddress = addressList.find((a: any) => a.address?.startsWith('0x'))?.address;

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "No EVM address found for wallet" },
        { status: 400 }
      );
    }

    console.log("[/api/wallet/register] Registering agent:", name, "wallet:", walletAddress);

    const result = await registerAgent({
      name,
      description,
      walletAddress,
      capabilities: ["x402-payment", "balance-query", "transfer", "erc8004-identity"],
    });

    console.log("[/api/wallet/register] Result:", JSON.stringify(result));

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[/api/wallet/register] Error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: error?.message || "Registration failed" },
      { status: 500 }
    );
  }
}
