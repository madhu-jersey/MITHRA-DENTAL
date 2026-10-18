// Reads width and height from a JPG, PNG or WebP file header (no dependencies).
// Returns { type, width, height } or null for unsupported files.
import { readFileSync } from "node:fs";

export function imageSize(file) {
  const b = readFileSync(file);
  // PNG
  if (b.length > 24 && b[0] === 0x89 && b.toString("ascii", 1, 4) === "PNG") {
    return { type: "png", width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }
  // JPEG: walk the markers until a start-of-frame
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return { type: "jpg", height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
    return null;
  }
  // WebP
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8 ") return { type: "webp", width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L") {
      const b0 = b[21], b1 = b[22], b2 = b[23], b3 = b[24];
      return { type: "webp", width: 1 + (((b1 & 0x3f) << 8) | b0), height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)) };
    }
    if (chunk === "VP8X") return { type: "webp", width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
  }
  return null;
}
