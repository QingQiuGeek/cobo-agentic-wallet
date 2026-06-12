import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/agent";

// POST /a2a - A2A JSON-RPC 2.0 Endpoint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jsonrpc, method, params, id } = body;

    // Validate JSON-RPC 2.0
    if (jsonrpc !== "2.0") {
      return NextResponse.json({
        jsonrpc: "2.0",
        error: { code: -32600, message: "Invalid Request: jsonrpc must be '2.0'" },
        id: id || null,
      });
    }

    // Handle different methods
    switch (method) {
      case "message/send": {
        const userMessage = params?.message?.parts?.[0]?.text;
        if (!userMessage) {
          return NextResponse.json({
            jsonrpc: "2.0",
            error: { code: -32602, message: "Invalid params: message text required" },
            id,
          });
        }

        // Run the agent
        const result = await runAgent(userMessage);

        return NextResponse.json({
          jsonrpc: "2.0",
          result: {
            message: {
              role: "agent",
              parts: [{ type: "text", text: result.text }],
            },
            tools: result.steps,
          },
          id,
        });
      }

      case "tasks/get": {
        // Placeholder for task status
        return NextResponse.json({
          jsonrpc: "2.0",
          result: {
            taskId: params?.taskId,
            status: "completed",
          },
          id,
        });
      }

      case "tasks/cancel": {
        return NextResponse.json({
          jsonrpc: "2.0",
          result: {
            taskId: params?.taskId,
            status: "cancelled",
          },
          id,
        });
      }

      default:
        return NextResponse.json({
          jsonrpc: "2.0",
          error: { code: -32601, message: `Method not found: ${method}` },
          id,
        });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({
      jsonrpc: "2.0",
      error: { code: -32603, message },
      id: null,
    });
  }
}

// OPTIONS /a2a - CORS preflight
export async function OPTIONS() {
  return NextResponse.json(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
