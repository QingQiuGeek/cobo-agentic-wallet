import { NextRequest } from "next/server";
import { runAgentStream } from "@/lib/agent";

// POST /api/chat - Send message to Agent (streaming)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required field: message" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("[/api/chat] Received message:", message);
    console.log("[/api/chat] AI config:", {
      baseURL: process.env.AI_BASE_URL,
      model: process.env.AI_MODEL_NAME,
      hasKey: !!process.env.AI_API_KEY,
    });

    const result = await runAgentStream(message);

    console.log("[/api/chat] Stream created, returning response");
    return result.toTextStreamResponse();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/chat] Error:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
