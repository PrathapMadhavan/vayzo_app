import app from "../../mockServer.js";

export default function handler(req, res) {
  const current = req.url || "/";
  if (!current.startsWith("/api/v1")) {
    const queryIndex = current.indexOf("?");
    const pathPart = queryIndex >= 0 ? current.slice(0, queryIndex) : current;
    const query = queryIndex >= 0 ? current.slice(queryIndex) : "";
    const suffix = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
    req.url = `/api/v1${suffix === "/" ? "" : suffix}${query}`;
  }
  return app(req, res);
}
