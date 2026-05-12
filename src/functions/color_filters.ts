import {
  type Color,
  blend,
  filterContrast,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  filterDeficiencyTrit,
  filterGrayscale,
  filterHueRotate,
  filterInvert,
  filterSaturate,
  filterSepia,
  formatHex,
  parse,
  toGamut,
} from "culori";

export type CvdType = "prot" | "deuter" | "trit";

const mapHexes = (
  hexes: string[],
  fn: (c: Color) => Color | undefined,
): string[] =>
  hexes.map((h) => {
    const parsed = parse(h);
    const out = parsed ? fn(parsed) : undefined;
    return out ? (formatHex(out) ?? h) : h;
  });

// Simulate how `hexes` reads to a viewer with the given colour-vision
// deficiency (Brettel/Viénot, full severity). Non-destructive — just a preview.
export const simulateCvd = (hexes: string[], type: CvdType): string[] => {
  const sim =
    type === "prot"
      ? filterDeficiencyProt(1)
      : type === "deuter"
        ? filterDeficiencyDeuter(1)
        : filterDeficiencyTrit(1);
  return mapHexes(hexes, sim);
};

// Pull every swatch into the displayable sRGB gamut by reducing chroma in
// OKLCH (hue/lightness preserved). A no-op on colours that are already in gamut.
const intoSrgb = toGamut("rgb", "oklch");
export const snapToGamut = (hexes: string[]): string[] =>
  mapHexes(hexes, intoSrgb);

// --- EFFECTS: one-shot culori CSS-style filters over the whole palette ---

export interface Effect {
  key: string;
  label: string;
}

export const EFFECTS: readonly Effect[] = [
  { key: "grayscale", label: "GRAYSCALE" },
  { key: "sepia", label: "SEPIA" },
  { key: "invert", label: "INVERT" },
  { key: "saturate", label: "SATURATE+" },
  { key: "desaturate", label: "DESATURATE" },
  { key: "contrast", label: "CONTRAST+" },
  { key: "hue-warm", label: "HUE +30" },
  { key: "hue-cool", label: "HUE -30" },
];

const identity = (c: Color): Color => c;

const EFFECT_FNS: Record<string, (c: Color) => Color | undefined> = {
  grayscale: filterGrayscale(1),
  sepia: filterSepia(1),
  invert: filterInvert(1),
  saturate: filterSaturate(1.6),
  desaturate: filterSaturate(0.5),
  contrast: filterContrast(1.4),
  "hue-warm": filterHueRotate(30),
  "hue-cool": filterHueRotate(-30),
};

// Apply a named effect to every swatch. Unknown key → input unchanged.
export const applyEffect = (hexes: string[], key: string): string[] =>
  mapHexes(hexes, EFFECT_FNS[key] ?? identity);

// --- BLEND: composite the whole palette under a chosen colour ---

export type BlendMode =
  | "multiply"
  | "screen"
  | "overlay"
  | "soft-light"
  | "hard-light"
  | "darken"
  | "lighten"
  | "difference";

export const BLEND_MODES: readonly BlendMode[] = [
  "multiply",
  "screen",
  "overlay",
  "soft-light",
  "hard-light",
  "darken",
  "lighten",
  "difference",
];

// Composite `over` on top of each swatch with the given Porter-Duff/separable
// blend mode. Unparsable `over` → input unchanged.
export const blendWith = (
  hexes: string[],
  over: string,
  mode: BlendMode,
): string[] => {
  if (!parse(over)) return hexes;
  return hexes.map((h) =>
    parse(h) ? (formatHex(blend([h, over], mode)) ?? h) : h,
  );
};
