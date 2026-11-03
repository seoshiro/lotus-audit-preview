import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("dist");
const types = {
  ".json": "application/json",
  ".glb": "model/gltf-binary",
  ".png": "image/png",
  ".xml": "application/xml",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};
createServer(async (req, res) => {
  try {
    const u = new URL(req.url || "/", "http://127.0.0.1:5317");
    const relative = decodeURIComponent(u.pathname);
    let path = resolve(root, `.${relative}`);
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    if ((await stat(path)).isDirectory()) path = resolve(path, "index.html");
    const data = await readFile(path);
    res.writeHead(200, {
      "Content-Type": types[extname(path)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Content-Security-Policy":
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Page not found. Return to /index.html");
  }
}).listen(5317, "127.0.0.1", () =>
  console.log("Portfolio preview: http://127.0.0.1:5317"),
);
