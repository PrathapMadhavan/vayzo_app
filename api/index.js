import app from "../mockServer.js";

function restoreUrl(req) {
  const current = req.url || "/";
  const parsed = new URL(current, "http://localhost");
  const orig =
    parsed.searchParams.get("p") ||
    parsed.searchParams.get("orig") ||
    req.query?.p ||
    req.query?.orig;

  if (typeof orig === "string" && orig.startsWith("/")) {
    parsed.searchParams.delete("p");
    parsed.searchParams.delete("orig");
    const qs = parsed.searchParams.toString();
    req.url = orig + (qs ? `?${qs}` : "");
    return;
  }

  // Vercel catch-all fallback: /api/[...path]
  const segments = req.query?.path;
  if (segments != null) {
    const suffix = Array.isArray(segments) ? segments.join("/") : String(segments);
    parsed.searchParams.delete("path");
    const qs = parsed.searchParams.toString();
    req.url = `/api/${suffix}`.replace(/\/{2,}/g, "/") + (qs ? `?${qs}` : "");
    return;
  }

  if (
    current.startsWith("/api/") ||
    current.startsWith("/settings") ||
    current.startsWith("/deliveryPartners") ||
    current.startsWith("/restaurant_products")
  ) {
    return;
  }

  const forwarded = req.headers["x-forwarded-uri"] || req.headers["x-invoke-path"];
  if (typeof forwarded === "string" && forwarded.startsWith("/")) {
    req.url = forwarded;
  }
}

export default function handler(req, res) {
  restoreUrl(req);
  return app(req, res);
}
