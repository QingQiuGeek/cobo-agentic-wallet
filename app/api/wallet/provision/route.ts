import { NextRequest, NextResponse } from "next/server";
import { Configuration, IdentityApi } from "@cobo/agentic-wallet";

// POST /api/wallet/provision - Provision a new agent and get owner API key
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name = "CoboAgent", token } = body;

    console.log("[/api/wallet/provision] Provisioning agent:", name);

    // Use service-level API key for provisioning
    const config = new Configuration({
      apiKey: process.env.AGENT_WALLET_API_KEY,
      basePath: process.env.AGENT_WALLET_API_URL || "https://api.agenticwallet.cobo.com",
    });

    const identityApi = new IdentityApi(config);

    // Provision agent
    const provisionRequest: any = { name };
    if (token) {
      provisionRequest.token = token; // For paired mode
    }

    const result = await identityApi.provisionAgent(provisionRequest);
    console.log("[/api/wallet/provision] Result:", JSON.stringify(result.data, null, 2));

    const data = result.data.result;

    return NextResponse.json({
      success: true,
      agent: {
        agentId: data.agent_id,
        apiKey: data.api_key,  // This is the owner key - store securely!
        status: data.status,
        ownerId: data.owner_id,
      },
      message: "Agent provisioned successfully. Update .env.local with the new api_key.",
    });
  } catch (error: any) {
    console.error("[/api/wallet/provision] Error:", error?.response?.data || error?.message || error);
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
