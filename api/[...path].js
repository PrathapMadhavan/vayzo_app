import app from "../mockServer.js";

function buildApiUrl(req) {
  const current = req.url || "/";
  const parsed = new URL(current, "http://localhost");

  // Preferred: explicit original path from rewrite helper
  const orig = parsed.searchParams.get("p") || parsed.searchParams.get("orig");
  if (typeof orig === "string" && orig.startsWith("/")) {
    parsed.searchParams.delete("p");
    parsed.searchParams.delete("orig");
    const qs = parsed.searchParams.toString();
    return orig + (qs ? `?${qs}` : "");
  }

  // Vercel catch-all: /api/[...path] -> query.path
  const segments = req.query?.path;
  if (segments != null) {
    const suffix = Array.isArray(segments) ? segments.join("/") : String(segments);
    parsed.searchParams.delete("path");
    const qs = parsed.searchParams.toString();
    return `/api/${suffix}`.replace(/\/{2,}/g, "/") + (qs ? `?${qs}` : "");
  }

  const forwarded = req.headers["x-forwarded-uri"] || req.headers["x-invoke-path"];
  if (typeof forwarded === "string" && forwarded.startsWith("/")) {
    return forwarded;
  }

  if (current.startsWith("/api/") || current.startsWith("/settings") || current.startsWith("/deliveryPartners") || current.startsWith("/restaurant_products")) {
    return current;
  }

  return "/api" + (current.startsWith("/") ? current : `/${current}`);
}

export default function handler(req, res) {
  req.url = buildApiUrl(req);
  return app(req, res);
}
