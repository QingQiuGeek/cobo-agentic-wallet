import { NextRequest, NextResponse } from "next/server";
import { submitPact, getCurrentWalletUuid } from "@/lib/caw";

// POST /api/wallet/pact/create - Create a new Pact with transfer permission
export async function POST(req: NextRequest) {
  try {
    const walletUuid = getCurrentWalletUuid();

    if (!walletUuid) {
      return NextResponse.json(
        { success: false, error: "No wallet configured" },
        { status: 400 }
      );
    }

    console.log("[/api/wallet/pact/create] Creating Pact for wallet:", walletUuid);

    const result = await submitPact({
      intent: "Allow agent to transfer tokens, call contracts, and query balances",
      policies: [
        {
          name: "transfer-policy",
          type: "transfer",
          rules: {
            effect: "allow",
            when: {
              chain_in: ["SETH"],
            },
          },
        },
        {
          name: "contract-call-policy",
          type: "contract_call",
          rules: {
            effect: "allow",
            when: {
              chain_in: ["SETH"],
            },
          },
        },
        {
          name: "message-sign-policy",
          type: "message_sign",
          rules: {
            effect: "allow",
            when: {
              chain_in: ["SETH"],
            },
          },
        },
      ],
      completionConditions: [
        { type: "time_elapsed", threshold: "86400" },  // 24h
      ],
    });

    console.log("[/api/wallet/pact/create] Pact created:", JSON.stringify(result).slice(0, 300));

    return NextResponse.json({ success: true, pact: result });
  } catch (error: any) {
    console.error("[/api/wallet/pact/create] Error:", error?.response?.data || error?.message || error);
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
