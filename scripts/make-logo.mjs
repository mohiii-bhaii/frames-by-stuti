// Builds the transparent logo files from the brand reference.
// Run with: npm run logo
//
// The reference is a JPEG on an off-white background. Each pixel's background
// is removed by "colour to alpha", so soft edges stay smooth with no light
// fringe. Two inks are written: the original dark ink for cream areas, and a
// cream ink for photos and the dark footer, where the tan accents are kept.
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "scripts", "brand", "logo-reference.jpg");
const outDir = join(root, "public", "brand");
mkdirSync(outDir, { recursive: true });

const BACKGROUND = [253, 251, 246];
const CREAM = [235, 230, 219]; // --color-cream
const ESPRESSO = [53, 48, 38]; // --color-espresso, for the favicon tile

const { data, info } = await sharp(source).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width } = info;

/** Separates each pixel into an ink colour and an opacity over the background. */
function unmix(r, g, b) {
  const channels = [r, g, b];
  let alpha = 0;
  // The ink is always darker than the paper, so only darkening counts. Pixels
  // a little lighter than the background are JPEG noise.
  channels.forEach((value, i) => {
    alpha = Math.max(alpha, (BACKGROUND[i] - value) / BACKGROUND[i]);
  });
  // JPEG noise in the background becomes fully transparent.
  if (alpha < 0.05) return null;
  alpha = Math.min(1, (alpha - 0.05) / 0.95);
  const ink = channels.map((value, i) => {
    const bg = BACKGROUND[i];
    return Math.max(0, Math.min(255, Math.round((value - bg) / Math.max(alpha, 0.01) + bg)));
  });
  return { ink, alpha };
}

/** Near-black ink becomes cream; the tan accents keep their colour. */
function toLight([r, g, b]) {
  const lightness = (Math.max(r, g, b) + Math.min(r, g, b)) / 510;
  const keep = Math.min(1, Math.max(0, (lightness - 0.2) / 0.25));
  return [r, g, b].map((value, i) => Math.round(CREAM[i] * (1 - keep) + value * keep));
}

function render({ left, top, w, h, light, skip }) {
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const sx = left + x;
      const sy = top + y;
      if (skip?.(sx, sy)) continue;
      const i = (sy * width + sx) * 3;
      const pixel = unmix(data[i], data[i + 1], data[i + 2]);
      if (!pixel) continue;
      const [r, g, b] = light ? toLight(pixel.ink) : pixel.ink;
      const o = (y * w + x) * 4;
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      out[o + 3] = Math.round(pixel.alpha * 255);
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } });
}

const PAD = 8;
// Measured from the reference: camera and corners 235-542, name 574-895, tagline 957-982.
const full = { left: 134 - PAD, top: 235 - PAD, w: 1116 - 134 + 1 + PAD * 2, h: 982 - 235 + 1 + PAD * 2 };
// "FRAMES" with its swash and "BY STUTI", without the camera or the corner marks.
const wordmark = { left: 134 - PAD, top: 574 - PAD, w: 1116 - 134 + 1 + PAD * 2, h: 895 - 574 + 1 + PAD * 2 };
const outsideName = (x, y) => y >= 765 && (x < 300 || x > 955);

const jobs = [
  ["logo.png", { ...full, light: false }],
  ["logo-light.png", { ...full, light: true }],
  ["wordmark.png", { ...wordmark, light: false, skip: outsideName }],
  ["wordmark-light.png", { ...wordmark, light: true, skip: outsideName }],
];

for (const [name, job] of jobs) {
  await render(job).png({ compressionLevel: 9, palette: false }).toFile(join(outDir, name));
  console.log(`Wrote public/brand/${name} (${job.w}×${job.h})`);
}

// Favicon: the camera in cream on an espresso tile, which stays legible at 16px.
const camera = { left: 290, top: 226, w: 676, h: 324, light: true };
const mark = await render(camera).resize({ width: 420 }).png().toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: { r: ESPRESSO[0], g: ESPRESSO[1], b: ESPRESSO[2], alpha: 1 } },
})
  .composite([{ input: mark, gravity: "center" }])
  .png()
  .toFile(join(root, "app", "icon.png"));
console.log("Wrote app/icon.png (512×512)");
