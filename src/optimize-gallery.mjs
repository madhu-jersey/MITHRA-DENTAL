// Gallery photo optimiser: makes 1600px and 800px WebP copies of each gallery photo
// so large uploads are compressed before display. Uses headless Edge or Chrome
// (already on most machines), so no extra packages are needed.
// Run:  node src/optimize-gallery.mjs   (then: node src/build.mjs)
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { imageSize } from "./image-size.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(readFileSync(process.env.GALLERY_JSON || join(ROOT, "src", "gallery.json"), "utf8"));
const OUT = join(ROOT, "assets", "img", "gallery", "opt");
const MANIFEST = join(ROOT, "src", "gallery.manifest.json");
const SIZES = [1600, 800];
const QUALITY = 0.82;

const browsers = [
  process.env.CHROME_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const browser = browsers.find((p) => existsSync(p));

const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : {};
const todo = [];
for (const p of cfg.photos) {
  if (!p.src) continue;
  const file = join(ROOT, p.src);
  if (!existsSync(file)) { console.warn(`missing file: ${p.src}`); continue; }
  const size = imageSize(file);
  if (!size) { console.warn(`not a JPG, PNG or WebP: ${p.src}`); continue; }
  if (size.width < cfg.minWidth) { console.warn(`too small (${size.width}px wide, needs ${cfg.minWidth}px): ${p.src}`); continue; }
  const mtime = statSync(file).mtimeMs;
  if (manifest[p.src] && manifest[p.src].mtime === mtime) continue; // already done
  todo.push({ src: p.src, file, size, mtime });
}
if (!todo.length) { console.log("Gallery photos are up to date."); process.exit(0); }
if (!browser) { console.warn("Edge/Chrome not found (set CHROME_PATH). Original files will be used."); process.exit(0); }

mkdirSync(OUT, { recursive: true });
const port = 9500 + Math.floor(Math.random() * 300);
const proc = spawn(browser, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${join(process.env.TEMP || "/tmp", "sm-gallery-" + port)}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 80; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (targets.length) break; } catch {} await sleep(250); }
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d.result); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

for (const t of todo) {
  const mime = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" }[t.size.type];
  const dataUrl = `data:${mime};base64,` + readFileSync(t.file).toString("base64");
  const expr = `new Promise((res, rej) => { const im = new Image(); im.onload = () => {
      const out = {};
      for (const w of ${JSON.stringify(SIZES)}) {
        const tw = Math.min(w, im.naturalWidth), th = Math.round(im.naturalHeight * tw / im.naturalWidth);
        const c = document.createElement('canvas'); c.width = tw; c.height = th;
        const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, tw, th);
        out[w] = { w: tw, h: th, data: c.toDataURL('image/webp', ${QUALITY}) };
      }
      res(JSON.stringify(out)); }; im.onerror = () => rej('decode failed'); im.src = ${JSON.stringify(dataUrl)}; })`;
  const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  if (!r.result || r.result.type !== "string") { console.warn(`could not process ${t.src}`); continue; }
  const out = JSON.parse(r.result.value);
  const base = basename(t.src, extname(t.src));
  const entry = { mtime: t.mtime, width: t.size.width, height: t.size.height };
  for (const w of SIZES) {
    const rel = `assets/img/gallery/opt/${base}-${w}.webp`;
    writeFileSync(join(ROOT, rel), Buffer.from(out[w].data.split(",")[1], "base64"));
    entry[w === 1600 ? "large" : "small"] = { src: rel, w: out[w].w, h: out[w].h };
  }
  manifest[t.src] = entry;
  const before = statSync(t.file).size, after = statSync(join(ROOT, entry.large.src)).size;
  console.log(`optimised ${t.src}: ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB (1600px) + 800px copy`);
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
ws.close(); proc.kill();
process.exit(0);
