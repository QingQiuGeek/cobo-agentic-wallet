import { NextRequest, NextResponse } from "next/server";
import { faucetApi, getCurrentWalletUuid, listWalletAddresses } from "@/lib/caw";

// POST /api/wallet/faucet - Claim testnet tokens
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { tokenId = "SETH" } = body;

    const walletUuid = getCurrentWalletUuid();
    console.log("[/api/wallet/faucet] Claiming", tokenId, "for wallet:", walletUuid);

    if (!walletUuid) {
      return NextResponse.json(
        { success: false, error: "No wallet configured" },
        { status: 400 }
      );
    }

    // Get wallet address - must match the token's chain
    const addressesResp = await listWalletAddresses(walletUuid);
    const addrResult = addressesResp.result as any;
    const addressList = Array.isArray(addrResult) ? addrResult : addrResult?.items || [];

    // Find the correct address based on token chain
    // SETH/SETH_USDC = ETH chain → need 0x address
    // SOL/SOL_USDC = Solana chain → need Base58 address
    const isEthToken = tokenId.startsWith('S') && !tokenId.startsWith('SOL');
    const address = isEthToken
      ? addressList.find((a: any) => a.address?.startsWith('0x'))?.address
      : addressList.find((a: any) => !a.address?.startsWith('0x'))?.address;

    if (!address) {
      return NextResponse.json(
        { success: false, error: `No ${isEthToken ? 'EVM' : 'Solana'} address found for wallet` },
        { status: 400 }
      );
    }

    console.log("[/api/wallet/faucet] Depositing to:", address, "token:", tokenId, "chain:", isEthToken ? 'ETH' : 'SOL');

    const result = await faucetApi.deposit({
      address: address,
      token_id: tokenId,
    });

    console.log("[/api/wallet/faucet] Result:", JSON.stringify(result.data));

    return NextResponse.json({
      success: true,
      ...result.data,
    });
  } catch (error: any) {
    console.error("[/api/wallet/faucet] Error:", error?.response?.data || error?.message || error);
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
