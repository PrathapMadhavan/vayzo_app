import app from "../mockServer.js";

function restoreUrl(req) {
  const current = req.url || "/";
  if (
    current.startsWith("/api/v1/") ||
    current.startsWith("/api/settings") ||
    current.startsWith("/api/deliveryPartners") ||
    current.startsWith("/settings") ||
    current.startsWith("/deliveryPartners")
  ) {
    return;
  }

  const forwarded = req.headers["x-forwarded-uri"] || req.headers["x-invoke-path"];
  if (typeof forwarded === "string" && forwarded.startsWith("/")) {
    req.url = forwarded;
    return;
  }

  const orig = req.query?.p || req.query?.orig;
  if (typeof orig === "string" && orig.startsWith("/")) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query || {})) {
      if (key === "p" || key === "orig") continue;
      if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
      else if (value != null) params.append(key, String(value));
    }
    const qs = params.toString();
    req.url = orig + (qs ? `?${qs}` : "");
  }
}

export default function handler(req, res) {
  restoreUrl(req);
  return app(req, res);
}
