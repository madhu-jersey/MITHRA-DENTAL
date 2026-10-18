// Minimal static server for local preview (no dependencies).
// Run:  node src/serve.mjs   then open http://localhost:4173
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, dirname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT) || 4173;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".json": "application/json" };

createServer(async (req, res) => {
  try {
    let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
    if (path.startsWith("..") || path.startsWith("src")) throw new Error("forbidden");
    let file = join(ROOT, path);
    if ((await stat(file).catch(() => null))?.isDirectory()) {
      if (!req.url.split("?")[0].endsWith("/")) { res.writeHead(301, { Location: req.url.replace(/(\?|$)/, "/$1") }); return res.end(); }
      file = join(file, "index.html");
    }
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}`));
