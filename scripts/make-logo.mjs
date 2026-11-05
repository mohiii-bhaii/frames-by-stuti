// Builds the logo files from the brand artwork. Run with: npm run logo
//
// Source: scripts/brand/frames-by-stuti-logo.png, the real Frames by Stuti logo
// (a transparent PNG with a lot of empty space around the artwork). It is
// trimmed to the artwork so it can be sized exactly, then written twice:
//   logo.png        the original dark ink, for cream backgrounds
//   logo-light.png  the same artwork in cream, for the dark footer and photos
// The favicon is the camera in cream on an espresso tile.
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "scripts", "brand", "frames-by-stuti-logo.png");
const outDir = join(root, "public", "brand");
mkdirSync(outDir, { recursive: true });

const CREAM = [235, 230, 219]; // --color-cream
const ESPRESSO = [53, 48, 38]; // --color-espresso
const PAD = 12;

const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

// The artwork's bounds: anything noticeably opaque.
let minX = width, minY = height, maxX = 0, maxY = 0;
for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    if (data[(y * width + x) * 4 + 3] > 24) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
}
const box = {
  left: Math.max(0, minX - PAD),
  top: Math.max(0, minY - PAD),
  width: Math.min(width, maxX + PAD + 1) - Math.max(0, minX - PAD),
  height: Math.min(height, maxY + PAD + 1) - Math.max(0, minY - PAD),
};

/** The artwork, trimmed. With `light`, every pixel becomes cream and keeps its opacity. */
async function render({ light, region = box }) {
  const cropped = await sharp(source).ensureAlpha().extract(region).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(cropped.data);
  if (light) {
    for (let i = 0; i < out.length; i += 4) {
      out[i] = CREAM[0];
      out[i + 1] = CREAM[1];
      out[i + 2] = CREAM[2];
    }
  }
  return sharp(out, { raw: { width: cropped.info.width, height: cropped.info.height, channels: 4 } });
}

for (const [name, light] of [["logo.png", false], ["logo-light.png", true]]) {
  await (await render({ light })).png({ compressionLevel: 9 }).toFile(join(outDir, name));
  console.log(`Wrote public/brand/${name} (${box.width}×${box.height})`);
}

// Favicon: the top of the camera outline in cream on an espresso tile.
// Cut above the lettering, so only the camera top (body, bump and lens arc) is left.
const camera = { left: box.left, top: box.top, width: box.width, height: 255 };
const mark = await (await render({ light: true, region: camera })).resize({ width: 400 }).png().toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: { r: ESPRESSO[0], g: ESPRESSO[1], b: ESPRESSO[2], alpha: 1 } },
})
  .composite([{ input: mark, gravity: "center" }])
  .png()
  .toFile(join(root, "app", "icon.png"));
console.log("Wrote app/icon.png (512×512)");
