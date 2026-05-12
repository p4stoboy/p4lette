import { clampChroma, formatHex, oklch } from "culori";
import { ColorPaletteGenerator, PaletteStyle } from "pro-color-harmonies";
import { colorUtils } from "rampensau";
import { hexToHsl, hslToHex } from "./color_converters";

export type { PaletteStyle } from "pro-color-harmonies";

export type HarmonyKind =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "split"
  | "monochrome"
  | "shades";

const COUNTS: Record<HarmonyKind, number> = {
  complementary: 2,
  analogous: 3,
  triadic: 3,
  tetradic: 4,
  split: 3,
  monochrome: 5,
  shades: 3,
};

type LibKind =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "splitComplementary";

const LIB_KIND: Partial<Record<HarmonyKind, LibKind>> = {
  complementary: "complementary",
  analogous: "analogous",
  triadic: "triadic",
  tetradic: "tetradic",
  split: "splitComplementary",
};

// pro-color-harmonies geometric styles — `default` reproduces the prior
// behaviour; the others re-arrange the hue relationships.
export const HARMONY_STYLES: readonly PaletteStyle[] = [
  "default",
  "square",
  "triangle",
  "circle",
  "diamond",
];

export interface HsvHarmony {
  key: string;
  label: string;
}

// rampensau's HSV-space harmonies — geometry pro-color-harmonies doesn't cover
// (pentadic / hexadic / compound / double-complementary), plus the staples.
// Each `colorHarmonies` fn maps a seed hue to a list of *absolute* hues (the
// seed's own hue is the first element).
export const HARMONY_HSV_KINDS: readonly HsvHarmony[] = [
  { key: "complementary", label: "COMPLEMENTARY" },
  { key: "analogous", label: "ANALOGOUS" },
  { key: "triadic", label: "TRIADIC" },
  { key: "tetradic", label: "TETRADIC" },
  { key: "splitComplementary", label: "SPLIT-COMP" },
  { key: "pentadic", label: "PENTADIC" },
  { key: "hexadic", label: "HEXADIC" },
  { key: "compound", label: "COMPOUND" },
  { key: "doubleComplementary", label: "DBL-COMP" },
];

interface OKLCH {
  l: number;
  c: number;
  h: number;
}

const toHex = (color: OKLCH): string => {
  const clamped = clampChroma(
    { mode: "oklch", l: color.l, c: color.c, h: color.h },
    "oklch",
  );
  return formatHex(clamped) ?? "#000000";
};

const dedupeByHue = (colors: OKLCH[], count: number): OKLCH[] => {
  const seen = new Set<number>();
  const picked: OKLCH[] = [];
  for (const c of colors) {
    const bucket = Math.round(c.h);
    if (seen.has(bucket)) continue;
    seen.add(bucket);
    picked.push(c);
    if (picked.length === count) break;
  }
  while (picked.length < count && colors.length) {
    picked.push(colors[picked.length % colors.length]);
  }
  return picked;
};

const lightnessRamp = (base: OKLCH, count: number, spread: number): OKLCH[] => {
  if (count === 1) return [base];
  const minL = Math.max(0.1, base.l - spread);
  const maxL = Math.min(0.95, base.l + spread);
  const step = (maxL - minL) / (count - 1);
  return Array.from({ length: count }, (_, i) => ({
    l: minL + i * step,
    c: base.c,
    h: base.h,
  }));
};

// Evenly resample an OKLCH ramp to exactly `count` colours by lerping through it.
const resampleRamp = (ramp: OKLCH[], count: number): OKLCH[] => {
  if (ramp.length === 0) return [];
  if (count <= 1) return [ramp[Math.floor(ramp.length / 2)]];
  return Array.from({ length: count }, (_, i) => {
    const p = (i / (count - 1)) * (ramp.length - 1);
    const lo = Math.floor(p);
    const hi = Math.min(lo + 1, ramp.length - 1);
    const t = p - lo;
    const a = ramp[lo];
    const b = ramp[hi];
    return {
      l: a.l + (b.l - a.l) * t,
      c: a.c + (b.c - a.c) * t,
      h: a.h + (b.h - a.h) * t,
    };
  });
};

// Tints & shades via pro-color-harmonies (so the geometric `style` now applies
// to MONOCHROME/SHADES too — `default`/`square` hold the hue, the others bend
// hue/chroma slightly), re-spanned to the same lightness window the plain ramp
// used and resampled to `count`. Falls back to the local ramp if the lib is no help.
const tintsShadesRamp = (
  base: OKLCH,
  count: number,
  spread: number,
  style: PaletteStyle,
): OKLCH[] => {
  const raw = ColorPaletteGenerator.generate(base, "tintsShades", { style })
    .map((c) => ({ l: c.l, c: c.c, h: c.h }))
    .sort((a, b) => a.l - b.l);
  if (raw.length < 2) return lightnessRamp(base, count, spread);
  const loL = Math.max(0.1, base.l - spread);
  const hiL = Math.min(0.95, base.l + spread);
  const minL = raw[0].l;
  const span = raw[raw.length - 1].l - minL || 1;
  const remapped = raw.map((c) => ({
    l: loL + ((c.l - minL) / span) * (hiL - loL),
    c: c.c,
    h: c.h,
  }));
  return resampleRamp(remapped, count);
};

export const harmony = (
  hex: string,
  kind: HarmonyKind,
  style: PaletteStyle = "default",
): string[] => {
  const parsed = oklch(hex);
  if (!parsed) return Array(COUNTS[kind]).fill(hex);
  const base: OKLCH = { l: parsed.l, c: parsed.c, h: parsed.h ?? 0 };

  if (kind === "monochrome") {
    return tintsShadesRamp(base, COUNTS.monochrome, 0.32, style).map(toHex);
  }
  if (kind === "shades") {
    return tintsShadesRamp(base, COUNTS.shades, 0.22, style).map(toHex);
  }

  const libKind = LIB_KIND[kind];
  if (!libKind) return Array(COUNTS[kind]).fill(hex);
  const full = ColorPaletteGenerator.generate(base, libKind, { style });
  const picked = dedupeByHue(
    full.map((c) => ({ l: c.l, c: c.c, h: c.h })),
    COUNTS[kind],
  );
  return picked.map(toHex);
};

// rampensau HSV-space harmony — `colorHarmonies[kind]` maps the seed hue to a
// list of absolute hues; we keep the seed's HSL saturation/lightness so the
// result is purely a hue-geometry variation. Unknown kind → complementary.
export const harmonyHsv = (hex: string, kindKey: string): string[] => {
  const fn =
    colorUtils.colorHarmonies[
      kindKey as keyof typeof colorUtils.colorHarmonies
    ] ?? colorUtils.colorHarmonies.complementary;
  const { h, s, l } = hexToHsl(hex);
  return fn(h).map((hue) => hslToHex({ h: ((hue % 360) + 360) % 360, s, l }));
};
