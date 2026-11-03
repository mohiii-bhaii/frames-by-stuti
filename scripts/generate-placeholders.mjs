// Generates the temporary, labelled photographs in /public/images.
// Run with: npm run placeholders
//
// The slot list lives in lib/images.ts. It is read as text so this script needs
// no TypeScript loader. Existing files are kept unless --force is passed, so
// real photos dropped into /public/images are never overwritten by accident.
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "images");
const force = process.argv.includes("--force");

const SIZES = {
  LANDSCAPE: [2000, 1250],
  PORTRAIT: [1200, 1500],
  SQUARE: [1000, 1000],
};

const source = readFileSync(join(root, "lib", "images.ts"), "utf8");
const slotPattern = /"([a-z0-9-]+)": \{ \.\.\.(LANDSCAPE|PORTRAIT|SQUARE), scene: "(\w+)"(, alt: "")?/g;
const slots = [...source.matchAll(slotPattern)].map(([, name, size, scene, decorative]) => ({
  name,
  // Background textures carry no label, since they show through as pattern.
  decorative: Boolean(decorative),
  width: SIZES[size][0],
  height: SIZES[size][1],
  scene,
}));

const PALETTES = {
  field: { top: "#d9d4cb", mid: "#c9b08c", low: "#7d6a45", accent: "#5f6a45", figure: "#efe4d3" },
  studio: { top: "#c49877", mid: "#b98a69", low: "#8f6548", accent: "#6e4a34", figure: "#f0e3d4" },
  soft: { top: "#cfc8c3", mid: "#c9bdb3", low: "#a78d7b", accent: "#8c6a56", figure: "#e7c6ad" },
  window: { top: "#a59c8f", mid: "#6f7362", low: "#4a4436", accent: "#353026", figure: "#e5d8c6" },
};

// Small deterministic generator so re-running gives identical files.
function seeded(text) {
  let value = 2166136261;
  for (const char of text) {
    value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  }
  return () => {
    value = Math.imul(value ^ (value >>> 15), 2246822507);
    value = Math.imul(value ^ (value >>> 13), 3266489909);
    value ^= value >>> 16;
    return (value >>> 0) / 4294967296;
  };
}

function figures(w, h, palette, random) {
  const count = 1 + Math.floor(random() * 3);
  const baseline = h * (0.86 + random() * 0.14);
  const scale = h * (0.42 + random() * 0.14);
  const centre = w * (0.36 + random() * 0.3);
  let shapes = "";
  for (let i = 0; i < count; i += 1) {
    const size = scale * (i === 0 ? 1 : 0.62 + random() * 0.3);
    const x = centre + (i - (count - 1) / 2) * size * 0.72;
    const headR = size * 0.16;
    const headY = baseline - size * 1.02;
    shapes += `
      <ellipse cx="${x}" cy="${baseline - size * 0.36}" rx="${size * 0.26}" ry="${size * 0.56}" fill="${palette.figure}"/>
      <circle cx="${x}" cy="${headY}" r="${headR}" fill="${palette.accent}"/>`;
  }
  return shapes;
}

function sceneArt(scene, w, h, palette, random) {
  const flare = `<circle cx="${w * (0.15 + random() * 0.7)}" cy="${h * (0.1 + random() * 0.25)}" r="${Math.max(w, h) * 0.42}" fill="#fff4e0" opacity="0.32"/>`;
  if (scene === "field") {
    const horizon = h * (0.5 + random() * 0.14);
    return `${flare}
      <ellipse cx="${w * 0.2}" cy="${horizon}" rx="${w * 0.42}" ry="${h * 0.14}" fill="${palette.accent}" opacity="0.85"/>
      <ellipse cx="${w * 0.85}" cy="${horizon}" rx="${w * 0.4}" ry="${h * 0.11}" fill="${palette.accent}" opacity="0.7"/>
      <rect x="0" y="${horizon}" width="${w}" height="${h - horizon}" fill="${palette.low}"/>
      <rect x="0" y="${horizon}" width="${w}" height="${(h - horizon) * 0.4}" fill="${palette.mid}" opacity="0.55"/>
      ${figures(w, h, palette, random)}`;
  }
  if (scene === "window") {
    return `
      <rect x="${w * (0.55 + random() * 0.15)}" y="${h * 0.08}" width="${w * 0.24}" height="${h * 0.62}" fill="#f4eee2" opacity="0.8"/>
      <rect x="0" y="${h * 0.78}" width="${w}" height="${h * 0.22}" fill="${palette.figure}" opacity="0.5"/>
      ${figures(w, h, palette, random)}`;
  }
  if (scene === "soft") {
    return `${flare}
      <ellipse cx="${w * (0.35 + random() * 0.3)}" cy="${h * 0.86}" rx="${w * 0.46}" ry="${h * 0.38}" fill="${palette.figure}"/>
      <ellipse cx="${w * (0.45 + random() * 0.2)}" cy="${h * 0.7}" rx="${w * 0.15}" ry="${h * 0.15}" fill="${palette.low}" opacity="0.75"/>`;
  }
  // studio
  return `${flare}${figures(w, h, palette, random)}`;
}

function svg({ name, width: w, height: h, scene, decorative }) {
  const palette = PALETTES[scene];
  const random = seeded(name);
  const blur = Math.max(w, h) * 0.05;
  const label = Math.round(Math.max(w, h) * 0.013);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${palette.top}"/>
        <stop offset="0.6" stop-color="${palette.mid}"/>
        <stop offset="1" stop-color="${palette.low}"/>
      </linearGradient>
      <radialGradient id="vignette" cx="50%" cy="45%" r="75%">
        <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
        <stop offset="1" stop-color="#22160a" stop-opacity="0.38"/>
      </radialGradient>
      <filter id="soften" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="${blur}"/>
      </filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>
    <g filter="url(#soften)">${sceneArt(scene, w, h, palette, random)}</g>
    <rect width="${w}" height="${h}" fill="url(#vignette)"/>
    ${decorative ? "" : `<text x="${w / 2}" y="${h - label * 2}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
      font-size="${label}" letter-spacing="${label * 0.14}" fill="#ffffff" fill-opacity="0.72">PLACEHOLDER · ${name.toUpperCase()}</text>`}
  </svg>`;
}

mkdirSync(outDir, { recursive: true });

let written = 0;
for (const slot of slots) {
  const file = join(outDir, `${slot.name}.jpg`);
  if (existsSync(file) && !force) continue;
  await sharp(Buffer.from(svg(slot))).jpeg({ quality: 76, mozjpeg: true }).toFile(file);
  written += 1;
}
console.log(`${slots.length} image slots, ${written} placeholder(s) written to public/images`);
