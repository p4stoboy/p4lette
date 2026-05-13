import { Resvg } from "@resvg/resvg-js";
import { mkdir, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { build, preview } from "vite";
import puppeteer from "puppeteer";

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

// The OG image is a real screenshot of the rendered landing page: a fresh
// browser context (empty localStorage) so the first-visit Welcome modal shows,
// forced to prefers-color-scheme: light (the skin defaults to SYSTEM theme).
async function buildOgPng() {
  process.stdout.write("og: vite build… ");
  await build({ logLevel: "silent" });
  process.stdout.write("ok\n");

  const server = await preview({
    preview: { port: 4178, strictPort: true },
    logLevel: "silent",
  });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([
      { name: "prefers-color-scheme", value: "light" },
    ]);
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
    await page.goto("http://localhost:4178/", { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");
    await new Promise((r) => setTimeout(r, 400));
    const png = await page.screenshot({ type: "png" });
    await writeFile(join(PUBLIC, "og.png"), png);
    process.stdout.write("wrote public/og.png (landing-page screenshot)\n");
  } finally {
    await browser.close();
    await server.close();
  }
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

  await buildOgPng();

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
