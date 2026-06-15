import { NextRequest, NextResponse } from "next/server";

// Server-side page cache (survives across requests in the same process)
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
interface CachedPage {
  services: any[];
  total: number;
  source: string;
  timestamp: number;
}
const pageCache = new Map<string, CachedPage>();

// Discovery URLs
const DISCOVERY_RESOURCE_URL = process.env.DISCOVERY_RESOURCE_URL || "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources";
const DISCOVERY_SEARCH_URL = process.env.DISCOVERY_SEARCH_URL || "https://api.cdp.coinbase.com/platform/v2/x402/discovery/search";
const DISCOVERY_FALLBACK_URL = "https://facilitator.payai.network/discovery/resources";

// GET /api/services - Discover available x402 paid services from Bazaar
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const query = url.searchParams.get("query") || "";

  // Check server-side page cache
  const cacheKey = `${offset}:${query}`;
  const cached = pageCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("[/api/services] Cache hit:", cacheKey);
    return NextResponse.json({
      success: true,
      services: cached.services,
      total: cached.total,
      limit,
      offset,
      source: cached.source,
    });
  }

  // Pick URL: search endpoint for queries, resource endpoint for listing
  const urlsToTry = query
    ? [DISCOVERY_SEARCH_URL, DISCOVERY_FALLBACK_URL]
    : [DISCOVERY_RESOURCE_URL, DISCOVERY_FALLBACK_URL];

  let lastError: string = "";

  for (const discoveryUrl of urlsToTry) {
    try {
      const apiUrl = new URL(discoveryUrl);
      if (query) {
        apiUrl.searchParams.set("query", query);
        apiUrl.searchParams.set("limit", String(limit));
      } else {
        apiUrl.searchParams.set("limit", String(limit));
        apiUrl.searchParams.set("offset", String(offset));
        apiUrl.searchParams.set("type", "http");
      }

      console.log("[/api/services] Fetching:", apiUrl.toString());

      const response = await fetch(apiUrl.toString(), {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        lastError = `${discoveryUrl} returned ${response.status}`;
        console.warn("[/api/services] Failed:", lastError);
        continue;
      }

      const data = await response.json();
      const items = data.items || data.resources || data || [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const services = Array.isArray(items) ? items.map((item: any, idx: number) => {
        const accept = item.accepts?.[0] || {};
        const name = item.name && item.name !== "Unknown Service"
          ? item.name
          : accept.description || accept.resource?.split('/').pop() || `Service ${idx + 1}`;
        const url = item.url || accept.resource || "";
        const description = item.description || accept.description || "";
        const network = accept.network || "";
        const price = accept.maxAmountRequired
          ? (Number(accept.maxAmountRequired) / 1e6).toFixed(2)
          : accept.amount
          ? (Number(accept.amount) / 1e6).toFixed(2)
          : "0.01";
        const asset = accept.extra?.name || (accept.network?.includes("solana") ? "SOL" : "USDC");

        return {
          id: item.id || `service-${idx}`,
          name,
          url,
          description,
          provider: accept.payTo ? `${accept.payTo.slice(0, 6)}...${accept.payTo.slice(-4)}` : "Unknown",
          icon: getIconForService(name),
          accepts: item.accepts || [],
          price,
          pricingToken: asset,
          network,
        };
      }) : [];

      const total = data.pagination?.total || data.total || services.length;

      console.log("[/api/services] Found", services.length, "services (total:", total, ") from", discoveryUrl);

      pageCache.set(cacheKey, { services, total, source: discoveryUrl, timestamp: Date.now() });

      return NextResponse.json({
        success: true,
        services,
        total,
        limit,
        offset,
        source: discoveryUrl,
      });
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      lastError = `${discoveryUrl}: ${errMsg}`;
      console.warn("[/api/services] Error:", lastError);
      continue;
    }
  }

  console.warn("[/api/services] All discovery URLs failed, returning empty list");
  return NextResponse.json({
    success: true,
    services: [],
    total: 0,
    limit,
    offset,
    source: "none",
    warning: lastError,
  });
}


// Helper: Get icon based on service name/description
function getIconForService(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("analysis") || lower.includes("analytics")) return "Search";
  if (lower.includes("prediction") || lower.includes("forecast")) return "TrendingUp";
  if (lower.includes("gas") || lower.includes("optimization")) return "Cpu";
  if (lower.includes("price") || lower.includes("market")) return "TrendingUp";
  return "Search";
}
