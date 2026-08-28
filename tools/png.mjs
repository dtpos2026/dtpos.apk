// ============================================================================
// A very small PNG reader, writer and resizer — with no dependencies at all
//
// WHY THIS EXISTS RATHER THAN `sharp`
//
// This repository's whole promise is that a restaurant's APK can be built with
// nothing but Android Studio, and branded with nothing but Node. sharp is a
// native module: it needs a toolchain, it ships a different binary per
// platform, and on Windows it is the single most common reason an npm install
// fails. Trading ~250 lines of well-specified format handling for that is a
// bad deal when all we ever do is "take one square logo and write it out at
// six sizes".
//
// WHAT IS SUPPORTED
//   read  — 8- and 16-bit, greyscale / RGB / palette / greyscale+alpha / RGBA,
//           non-interlaced. That is every PNG an export tool produces.
//   write — 8-bit RGBA, one filter type, which is all a launcher icon needs.
//
// An interlaced (Adam7) PNG is refused by name rather than decoded wrongly.
// ============================================================================
import { inflateSync, deflateSync } from 'node:zlib';

const SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// ----------------------------------------------------------------------- CRC
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

// -------------------------------------------------------------------- decode
/** @returns {{width:number,height:number,data:Buffer}} data is RGBA, 4 bytes per pixel. */
export function decodePng(buf) {
  if (!buf.subarray(0, 8).equals(SIG)) throw new Error('not a PNG file');

  let width = 0, height = 0, depth = 0, colorType = 0, interlace = 0;
  let palette = null, transparency = null;
  const idat = [];

  let p = 8;
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    const body = buf.subarray(p + 8, p + 8 + len);
    p += 12 + len;

    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      depth = body[8];
      colorType = body[9];
      interlace = body[12];
    } else if (type === 'PLTE') palette = Buffer.from(body);
    else if (type === 'tRNS') transparency = Buffer.from(body);
    else if (type === 'IDAT') idat.push(Buffer.from(body));
    else if (type === 'IEND') break;
  }

  if (interlace) throw new Error('interlaced (Adam7) PNGs are not supported — re-export without interlacing');
  if (depth !== 8 && depth !== 16) throw new Error(`unsupported bit depth ${depth} (need 8 or 16)`);

  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`unsupported PNG colour type ${colorType}`);
  if (colorType === 3 && !palette) throw new Error('palette PNG with no PLTE chunk');

  const raw = inflateSync(Buffer.concat(idat));
  const sampleBytes = depth === 16 ? 2 : 1;
  const pixelBytes = channels * sampleBytes;      // bytes per pixel, for filtering
  const rowBytes = width * pixelBytes;

  // ---- undo the per-row filters (PNG spec 9.2)
  const out = Buffer.alloc(height * rowBytes);
  let prev = Buffer.alloc(rowBytes);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (rowBytes + 1)];
    const row = raw.subarray(y * (rowBytes + 1) + 1, (y + 1) * (rowBytes + 1));
    const cur = out.subarray(y * rowBytes, (y + 1) * rowBytes);
    for (let i = 0; i < rowBytes; i++) {
      const a = i >= pixelBytes ? cur[i - pixelBytes] : 0;   // left
      const b = prev[i];                                     // above
      const c = i >= pixelBytes ? prev[i - pixelBytes] : 0;  // above-left
      let v = row[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const q = a + b - c;
        const pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      } else if (filter !== 0) throw new Error(`unknown PNG row filter ${filter}`);
      cur[i] = v & 0xff;
    }
    prev = cur;
  }

  // ---- widen whatever it was into RGBA
  const data = Buffer.alloc(width * height * 4);
  const sample = (base, ch) => out[base + ch * sampleBytes];   // 16-bit: keep the high byte
  for (let i = 0; i < width * height; i++) {
    const base = i * pixelBytes;
    let r, g, b, a = 255;
    if (colorType === 0) { r = g = b = sample(base, 0); }
    else if (colorType === 4) { r = g = b = sample(base, 0); a = sample(base, 1); }
    else if (colorType === 2) { r = sample(base, 0); g = sample(base, 1); b = sample(base, 2); }
    else if (colorType === 6) { r = sample(base, 0); g = sample(base, 1); b = sample(base, 2); a = sample(base, 3); }
    else {                                        // palette
      const idx = sample(base, 0);
      r = palette[idx * 3]; g = palette[idx * 3 + 1]; b = palette[idx * 3 + 2];
      if (transparency && idx < transparency.length) a = transparency[idx];
    }
    data[i * 4] = r; data[i * 4 + 1] = g; data[i * 4 + 2] = b; data[i * 4 + 3] = a;
  }
  return { width, height, data };
}

// -------------------------------------------------------------------- encode
export function encodePng({ width, height, data }) {
  const rowBytes = width * 4;
  const raw = Buffer.alloc(height * (rowBytes + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (rowBytes + 1)] = 0;                 // filter 0: none
    data.copy(raw, y * (rowBytes + 1) + 1, y * rowBytes, (y + 1) * rowBytes);
  }

  const chunk = (type, body) => {
    const out = Buffer.alloc(body.length + 12);
    out.writeUInt32BE(body.length, 0);
    out.write(type, 4, 'ascii');
    body.copy(out, 8);
    out.writeUInt32BE(crc32(out.subarray(4, 8 + body.length)), 8 + body.length);
    return out;
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;     // bit depth
  ihdr[9] = 6;     // colour type: RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    SIG,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// -------------------------------------------------------------------- resize
/**
 * Area-average when shrinking, bilinear when growing.
 *
 * A launcher icon is almost always a downscale of a large logo, and that is
 * exactly the case where sampling one source pixel per destination pixel looks
 * bad: thin strokes and lettering break up. Averaging the whole source
 * rectangle that a destination pixel covers is what keeps them readable.
 *
 * Alpha is premultiplied for the average and divided back out afterwards, or
 * the colour of fully transparent pixels bleeds into the visible edge as a
 * dark halo.
 */
export function resize(img, w, h) {
  const { width: sw, height: sh, data: src } = img;
  const dst = Buffer.alloc(w * h * 4);
  const xr = sw / w, yr = sh / h;
  const shrinking = xr > 1 || yr > 1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0;

      if (shrinking) {
        const x0 = Math.floor(x * xr), x1 = Math.min(sw, Math.max(x0 + 1, Math.ceil((x + 1) * xr)));
        const y0 = Math.floor(y * yr), y1 = Math.min(sh, Math.max(y0 + 1, Math.ceil((y + 1) * yr)));
        let n = 0;
        for (let sy = y0; sy < y1; sy++) {
          for (let sx = x0; sx < x1; sx++) {
            const i = (sy * sw + sx) * 4, av = src[i + 3] / 255;
            r += src[i] * av; g += src[i + 1] * av; b += src[i + 2] * av; a += src[i + 3];
            n++;
          }
        }
        r /= n; g /= n; b /= n; a /= n;
      } else {
        const fx = Math.min(sw - 1, (x + 0.5) * xr - 0.5), fy = Math.min(sh - 1, (y + 0.5) * yr - 0.5);
        const x0 = Math.max(0, Math.floor(fx)), y0 = Math.max(0, Math.floor(fy));
        const x1 = Math.min(sw - 1, x0 + 1), y1 = Math.min(sh - 1, y0 + 1);
        const tx = fx - x0, ty = fy - y0;
        for (const [sx, sy, wgt] of [
          [x0, y0, (1 - tx) * (1 - ty)], [x1, y0, tx * (1 - ty)],
          [x0, y1, (1 - tx) * ty], [x1, y1, tx * ty],
        ]) {
          const i = (sy * sw + sx) * 4, av = (src[i + 3] / 255) * wgt;
          r += src[i] * av; g += src[i + 1] * av; b += src[i + 2] * av; a += src[i + 3] * wgt;
        }
      }

      const i = (y * w + x) * 4;
      const un = a > 0 ? 255 / a : 0;             // undo the premultiply
      dst[i] = Math.min(255, Math.round(r * un));
      dst[i + 1] = Math.min(255, Math.round(g * un));
      dst[i + 2] = Math.min(255, Math.round(b * un));
      dst[i + 3] = Math.round(a);
    }
  }
  return { width: w, height: h, data: dst };
}

/**
 * Draw `img` centred on a square canvas, scaled to `coverage` of the side.
 *
 * Android's adaptive icon crops the foreground to a circle, squircle or
 * rounded square depending on the launcher, and only the middle 66% is
 * guaranteed to survive. A logo drawn edge to edge therefore loses its corners
 * on most phones, so the default leaves that margin.
 */
export function squareCanvas(img, side, coverage = 0.66, background = null) {
  const scale = Math.min((side * coverage) / img.width, (side * coverage) / img.height);
  const iw = Math.max(1, Math.round(img.width * scale));
  const ih = Math.max(1, Math.round(img.height * scale));
  const inner = resize(img, iw, ih);

  const data = Buffer.alloc(side * side * 4);
  if (background) {
    for (let i = 0; i < side * side; i++) {
      data[i * 4] = background[0]; data[i * 4 + 1] = background[1];
      data[i * 4 + 2] = background[2]; data[i * 4 + 3] = 255;
    }
  }

  const ox = Math.floor((side - iw) / 2), oy = Math.floor((side - ih) / 2);
  for (let y = 0; y < ih; y++) {
    for (let x = 0; x < iw; x++) {
      const s = (y * iw + x) * 4, d = ((y + oy) * side + (x + ox)) * 4;
      const sa = inner.data[s + 3] / 255;
      if (sa <= 0) continue;
      const da = data[d + 3] / 255, out = sa + da * (1 - sa);   // source-over
      for (let c = 0; c < 3; c++) {
        data[d + c] = Math.round((inner.data[s + c] * sa + data[d + c] * da * (1 - sa)) / out);
      }
      data[d + 3] = Math.round(out * 255);
    }
  }
  return { width: side, height: side, data };
}
