import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";

// POST /api/chat - Send message to Agent
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Missing required field: message" },
        { status: 400 }
      );
    }

    const result = await runAgent(message);

    return NextResponse.json({
      success: true,
      response: result.text,
      steps: result.steps,
      usage: result.usage,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
