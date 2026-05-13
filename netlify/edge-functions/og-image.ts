import satori from "https://esm.sh/satori@0.10.13";
import { initWasm, Resvg } from "https://esm.sh/@resvg/resvg-wasm@2.6.0";

// Per-palette OG image: a 1200×630 "bento-condensed" card (wordmark · mosaic
// hero · bars row with hex codes · footer) rendered with satori (JSX-like →
// SVG) and resvg-wasm (SVG → PNG). Driven by `?p=rrggbb-rrggbb-…`.
//
// Fonts are fetched from same-origin `/og-fonts/*.ttf` (vendored under
// `public/og-fonts/`) — Netlify Edge can't import binary files, so a same-POP
// fetch is the cheapest cold-start path. Both the fonts and the resvg wasm
// are cached at module scope across invocations on a warm instance.

const BG = "#FFF8E7";
const INK = "#0E0B08";
const ACCENT = "#FF3D00";
const BORDER = `3px solid ${INK}`;

const HEX_RE = /^[0-9a-fA-F]{6}$/;

const parseP = (raw: string | null): string[] => {
  if (!raw) return [];
  return raw
    .split("-")
    .filter((s) => HEX_RE.test(s))
    .map((s) => "#" + s.toLowerCase());
};

// WCAG-ish luminance for picking ink vs cream over a swatch.
const luminance = (hex: string): number => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const fontColorFor = (hex: string): string =>
  luminance(hex) > 0.55 ? INK : BG;

// One-shot resvg wasm init, guarded across invocations on the same instance.
let resvgReady: Promise<void> | null = null;
const ensureResvg = (): Promise<void> => {
  if (!resvgReady) {
    const wasmUrl = "https://esm.sh/@resvg/resvg-wasm@2.6.0/index_bg.wasm";
    resvgReady = fetch(wasmUrl)
      .then((r) => r.arrayBuffer())
      .then((buf) => initWasm(buf));
  }
  return resvgReady;
};

// Same-origin TTF fetch, cached across invocations.
let fontsReady: Promise<{ anton: ArrayBuffer; mono: ArrayBuffer }> | null =
  null;
const ensureFonts = (
  origin: string,
): Promise<{ anton: ArrayBuffer; mono: ArrayBuffer }> => {
  if (!fontsReady) {
    fontsReady = Promise.all([
      fetch(`${origin}/og-fonts/Anton-Regular.ttf`).then((r) =>
        r.arrayBuffer(),
      ),
      fetch(`${origin}/og-fonts/JetBrainsMono-Regular.ttf`).then((r) =>
        r.arrayBuffer(),
      ),
    ]).then(([anton, mono]) => ({ anton, mono }));
  }
  return fontsReady;
};

// Mosaic n×n cycled cells (matches the share page's ShareMosaic). The cells
// are filled by `palette[i % palette.length]` so repetition is the signature.
const mosaicRows = (hexes: string[]): unknown[] => {
  const n = Math.max(1, Math.ceil(Math.sqrt(hexes.length)));
  const rows: unknown[] = [];
  for (let r = 0; r < n; r++) {
    const cells: unknown[] = [];
    for (let c = 0; c < n; c++) {
      const idx = (r * n + c) % hexes.length;
      cells.push({
        type: "div",
        props: { style: { flex: 1, background: hexes[idx] } },
      });
    }
    rows.push({
      type: "div",
      props: {
        style: { display: "flex", flex: 1, minHeight: 0 },
        children: cells,
      },
    });
  }
  return rows;
};

// The bars-row hex label: drops as the palette grows. Omitted entirely past 16.
const labelFontSize = (n: number): number =>
  n <= 6 ? 32 : n <= 9 ? 26 : n <= 12 ? 22 : 18;

const renderTree = (hexes: string[]): unknown => {
  const n = hexes.length;
  const showLabels = n <= 16;
  const labelSize = labelFontSize(n);

  return {
    type: "div",
    props: {
      style: {
        width: 1200,
        height: 630,
        background: BG,
        color: INK,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Anton",
      },
      children: [
        // Top bar: wordmark P4 ★ LETTE
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              height: 128,
              padding: "0 56px",
              borderBottom: BORDER,
              fontSize: 92,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            },
            children: [
              { type: "span", props: { children: "P4" } },
              {
                type: "span",
                props: {
                  style: { color: ACCENT, padding: "0 14px" },
                  children: "★",
                },
              },
              { type: "span", props: { children: "LETTE" } },
            ],
          },
        },
        // Mosaic — fills the middle band
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
              borderBottom: BORDER,
            },
            children: mosaicRows(hexes),
          },
        },
        // Bars row — equal-flex swatches with the hex code centred per swatch
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              height: 140,
            },
            children: hexes.map((hex) => ({
              type: "div",
              props: {
                style: {
                  flex: 1,
                  background: hex,
                  color: fontColorFor(hex),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "JetBrainsMono",
                  fontSize: labelSize,
                  letterSpacing: "0.06em",
                },
                children: showLabels ? hex.slice(1).toUpperCase() : "",
              },
            })),
          },
        },
        // Footer line — "shared from p4lette.app" right-aligned
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              height: 58,
              padding: "0 28px",
              borderTop: BORDER,
              fontFamily: "JetBrainsMono",
              fontSize: 18,
              letterSpacing: "0.08em",
              opacity: 0.7,
            },
            children: "shared from p4lette.app",
          },
        },
      ],
    },
  };
};

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const hexes = parseP(url.searchParams.get("p"));

  // No usable palette → 302 to the static fallback so scrapers still get
  // *an* image instead of an error.
  if (hexes.length === 0) {
    return Response.redirect(`${url.origin}/og.png`, 302);
  }

  const [fonts] = await Promise.all([ensureFonts(url.origin), ensureResvg()]);

  // satori's type wants a ReactNode; the plain-object tree is the documented
  // alternative and works at runtime. Cast at the boundary.
  const svg = await satori(renderTree(hexes) as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Anton", data: fonts.anton, weight: 400, style: "normal" },
      {
        name: "JetBrainsMono",
        data: fonts.mono,
        weight: 400,
        style: "normal",
      },
    ],
  });

  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  })
    .render()
    .asPng();

  return new Response(png, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};
