import app from "../mockServer.js";

function withOriginalPath(req) {
  const current = req.url || "/";
  if (
    current.startsWith("/api/") ||
    current.startsWith("/settings") ||
    current.startsWith("/deliveryPartners")
  ) {
    return;
  }

  const invokePath = req.headers["x-invoke-path"];
  if (typeof invokePath === "string" && invokePath.startsWith("/")) {
    const queryIndex = current.indexOf("?");
    req.url = invokePath + (queryIndex >= 0 ? current.slice(queryIndex) : "");
    return;
  }

  req.url = "/api" + (current.startsWith("/") ? current : `/${current}`);
}

export default function handler(req, res) {
  withOriginalPath(req);
  return app(req, res);
}
