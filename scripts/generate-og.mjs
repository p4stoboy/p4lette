import { Resvg } from "@resvg/resvg-js";
import { mkdir, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");
const FONTS_DIR = join(__dirname, ".fonts");

const FONTS = [
  {
    file: "Anton-Regular.ttf",
    url: "https://github.com/google/fonts/raw/main/ofl/anton/Anton-Regular.ttf",
  },
  {
    file: "SpaceGrotesk-Variable.ttf",
    url: "https://github.com/google/fonts/raw/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf",
  },
  {
    file: "JetBrainsMono-Regular.ttf",
    url: "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf",
  },
];

async function ensureFonts() {
  await mkdir(FONTS_DIR, { recursive: true });
  for (const f of FONTS) {
    const path = join(FONTS_DIR, f.file);
    try {
      await access(path);
      continue;
    } catch {}
    process.stdout.write(`fetch ${f.file}… `);
    const res = await fetch(f.url);
    if (!res.ok) throw new Error(`${f.url} → ${res.status}`);
    await writeFile(path, Buffer.from(await res.arrayBuffer()));
    process.stdout.write("ok\n");
  }
}

const POSTER = { bg: "#FFF8E7", ink: "#0E0B08", accent: "#FF3D00" };

const PALETTE = [
  { hex: "#FF3D00", name: "CINNABAR" },
  { hex: "#0E5C9C", name: "PACIFIC" },
  { hex: "#F4C430", name: "SAFFRON" },
  { hex: "#3A6B35", name: "PINE" },
  { hex: "#7C3AED", name: "IRIS" },
];

const luminance = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const fontColorFor = (hex, dark, light) =>
  luminance(hex) > 0.55 ? dark : light;

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const starPolygon = (cx, cy, r, fill) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const ang = -Math.PI / 2 + (Math.PI / 5) * i;
    const rr = i % 2 === 0 ? r : r * 0.42;
    pts.push(
      `${(cx + Math.cos(ang) * rr).toFixed(2)},${(cy + Math.sin(ang) * rr).toFixed(2)}`,
    );
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}" />`;
};

// The OG card is the (only) skin — a poster-style swatch grid under a wordmark +
// nav bar. The dead "terminal" skin used to fill the bottom half; it's gone.
function buildOgSvg() {
  const W = 1200;
  const H = 630;
  const cols = PALETTE.length;
  const colW = W / cols;

  const NAV_H = 100;
  const wordmarkX = 36;
  const wordmarkY = NAV_H * 0.62;

  // Labels only — symbol glyphs (＋ ♥ …) drag the text run out of Space Grotesk.
  const buttons = [
    { label: "ADD", bold: true },
    { label: "SHUFFLE" },
    { label: "TOOLS" },
    { label: "SAVE" },
    { label: "EXPORT" },
  ];
  const navStartX = 470;
  const btnPad = 18;
  const btnFontSize = 20;
  const btnY = NAV_H * 0.6;
  let navX = navStartX;
  const navParts = buttons.map((b) => {
    const approxW = b.label.length * 12 + btnPad * 2;
    const x = navX;
    navX += approxW;
    return { text: b.label, x, bold: b.bold };
  });
  const navRules = navParts
    .map(
      (p) =>
        `<line x1="${p.x}" y1="0" x2="${p.x}" y2="${NAV_H}" stroke="${POSTER.ink}" stroke-width="3" />`,
    )
    .join("");
  const navTexts = navParts
    .map(
      (p) => `
      <text x="${p.x + btnPad}" y="${btnY}" fill="${POSTER.ink}"
        font-family="Space Grotesk" font-weight="${p.bold ? 700 : 600}"
        font-size="${btnFontSize}" letter-spacing="1.4">${escape(p.text)}</text>`,
    )
    .join("");

  const tagLineY = NAV_H + 56;
  const swatchTop = tagLineY + 30;
  const swatchH = H - swatchTop;

  const posterCols = PALETTE.map((c, i) => {
    const x = i * colW;
    const fg = fontColorFor(c.hex, POSTER.ink, POSTER.bg);
    return `
      <rect x="${x}" y="${swatchTop}" width="${colW}" height="${swatchH}" fill="${c.hex}" />
      <text x="${x + colW / 2}" y="${swatchTop + swatchH / 2 - 6}" fill="${fg}"
        font-family="Anton" font-size="64" text-anchor="middle"
        letter-spacing="1">${escape(c.name)}</text>
      <text x="${x + colW / 2}" y="${swatchTop + swatchH / 2 + 34}" fill="${fg}"
        font-family="JetBrains Mono" font-size="22" text-anchor="middle"
        opacity="0.85">${escape(c.hex)}</text>`;
  }).join("");

  const lastFg = fontColorFor(PALETTE[cols - 1].hex, POSTER.ink, POSTER.bg);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${POSTER.bg}" />
  <line x1="0" y1="${NAV_H}" x2="${W}" y2="${NAV_H}" stroke="${POSTER.ink}" stroke-width="3" />
  <text x="${wordmarkX}" y="${wordmarkY}" fill="${POSTER.ink}"
    font-family="Anton" font-size="72" letter-spacing="-1.4">P4</text>
  ${starPolygon(wordmarkX + 100, wordmarkY - 22, 24, POSTER.accent)}
  <text x="${wordmarkX + 138}" y="${wordmarkY}" fill="${POSTER.ink}"
    font-family="Anton" font-size="72" letter-spacing="-1.4">LETTE</text>
  ${navRules}
  ${navTexts}
  <text x="${W - 36}" y="${btnY}" fill="${POSTER.ink}"
    font-family="Space Grotesk" font-weight="600" font-size="22" letter-spacing="1.6"
    text-anchor="end">DARK MODE</text>
  <text x="${wordmarkX}" y="${tagLineY}" fill="${POSTER.ink}"
    font-family="Space Grotesk" font-weight="700" font-size="22" letter-spacing="3">
    DRAG · LOCK · SHUFFLE · SHARE</text>
  ${posterCols}
  <text x="${W - 24}" y="${H - 18}" fill="${lastFg}"
    font-family="JetBrains Mono" font-size="14" text-anchor="end" opacity="0.7">p4lette.app</text>
</svg>`;
}

function buildFaviconSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="${POSTER.bg}" />
  ${starPolygon(16, 16, 11, POSTER.accent)}
</svg>`;
}

function buildAppleTouchIconSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="36" fill="${POSTER.bg}" />
  <text x="35" y="118" font-family="Anton" font-size="120" fill="${POSTER.ink}"
    letter-spacing="-2">P4</text>
  ${starPolygon(146, 78, 26, POSTER.accent)}
</svg>`;
}

function rasterise(svg, width) {
  return new Resvg(svg, {
    font: {
      fontDirs: [FONTS_DIR],
      // Allow system fonts as fallback so glyphs missing from Anton / Space
      // Grotesk / JetBrains Mono (★ · etc.) resolve via Noto Sans Symbols /
      // DejaVu / similar. Brand fonts still win where they cover the glyph.
      loadSystemFonts: true,
      defaultFontFamily: "Space Grotesk",
    },
    fitTo: { mode: "width", value: width },
  })
    .render()
    .asPng();
}

async function main() {
  await ensureFonts();
  await mkdir(PUBLIC, { recursive: true });

  const ogSvg = buildOgSvg();
  await writeFile(join(PUBLIC, "og.png"), rasterise(ogSvg, 1200));
  process.stdout.write("wrote public/og.png\n");

  const favSvg = buildFaviconSvg();
  await writeFile(join(PUBLIC, "favicon.svg"), favSvg);
  await writeFile(join(PUBLIC, "favicon-32.png"), rasterise(favSvg, 32));
  process.stdout.write("wrote public/favicon.svg + favicon-32.png\n");

  const appleSvg = buildAppleTouchIconSvg();
  await writeFile(
    join(PUBLIC, "apple-touch-icon.png"),
    rasterise(appleSvg, 180),
  );
  process.stdout.write("wrote public/apple-touch-icon.png\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
