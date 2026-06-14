import { getAuditLogs, getCurrentWalletUuid } from "@/lib/caw";

// GET /api/wallet/audit/stream - SSE stream for audit logs
export async function GET() {
  const walletUuid = getCurrentWalletUuid();

  if (!walletUuid) {
    return new Response("No wallet configured", { status: 400 });
  }

  const encoder = new TextEncoder();
  let isClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      try {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "connected", walletUuid })}\n\n`)
        );
      } catch {
        isClosed = true;
        return;
      }

      let lastLogId = 0;

      // Poll for new audit logs every 3 seconds
      const pollInterval = setInterval(async () => {
        if (isClosed) {
          clearInterval(pollInterval);
          return;
        }

        try {
          const result = await getAuditLogs(5, walletUuid);
          const items = result?.result?.items || [];

          for (const log of items) {
            if (log.id > lastLogId && !isClosed) {
              lastLogId = log.id;
              try {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: "audit_log", log })}\n\n`)
                );
              } catch {
                // Client disconnected
                isClosed = true;
                clearInterval(pollInterval);
                return;
              }
            }
          }
        } catch (error) {
          console.error("[SSE] Audit log poll error:", error);
        }
      }, 3000);

      // Cleanup when stream is cancelled (client disconnects)
      // Note: cancel() is called when the client disconnects
    },

    cancel() {
      isClosed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
