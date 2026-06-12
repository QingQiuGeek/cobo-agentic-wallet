import { NextRequest, NextResponse } from "next/server";
import { submitPact, listPacts } from "@/lib/caw";

// POST /api/wallet/pact - Submit a new pact
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { intent, policies, completionConditions } = body;

    if (!intent || !policies) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: intent, policies" },
        { status: 400 }
      );
    }

    const result = await submitPact({ intent, policies, completionConditions });

    return NextResponse.json({ success: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// GET /api/wallet/pact - List pacts
export async function GET() {
  try {
    const result = await listPacts();
    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
