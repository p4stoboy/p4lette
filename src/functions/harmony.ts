import { clampChroma, formatHex, oklch } from "culori";
import { ColorPaletteGenerator, PaletteStyle } from "pro-color-harmonies";
import { rybHsl2rgb } from "rybitten";
import { cubes, type ColorCube } from "rybitten/cubes";
import { clamp, hexToHsl } from "./color_converters";

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

export interface RybCube {
  key: string;
  label: string;
}

// A curated slice of rybitten's pigment-wheel cubes (it ships ~30). `itten` is
// the default (Johannes Itten's chromatic circle); the rest are other
// historical painter's wheels.
export const RYB_CUBES: readonly RybCube[] = [
  { key: "itten", label: "ITTEN" },
  { key: "goethe", label: "GOETHE" },
  { key: "bezold", label: "BEZOLD" },
  { key: "munsell", label: "MUNSELL" },
  { key: "chevreul", label: "CHEVREUL" },
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

export const harmony = (
  hex: string,
  kind: HarmonyKind,
  style: PaletteStyle = "default",
): string[] => {
  const parsed = oklch(hex);
  if (!parsed) return Array(COUNTS[kind]).fill(hex);
  const base: OKLCH = { l: parsed.l, c: parsed.c, h: parsed.h ?? 0 };

  if (kind === "monochrome") {
    return lightnessRamp(base, COUNTS.monochrome, 0.32).map(toHex);
  }
  if (kind === "shades") {
    return lightnessRamp(base, COUNTS.shades, 0.22).map(toHex);
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

const RYB_DELTAS: Partial<Record<HarmonyKind, readonly number[]>> = {
  complementary: [0, 180],
  analogous: [-30, 0, 30],
  triadic: [0, 120, 240],
  tetradic: [0, 90, 180, 270],
  split: [0, 150, 210],
};

// Rotate `hue` (degrees) by `delta` on the given RYB pigment wheel (`cube`,
// defaults to rybitten's RYB_ITTEN when undefined) and return the OKLCH hue of
// the resulting pigment. Saturation/lightness are pinned so the cube yields the
// purest pigment for that angle — the seed's own L and C are reapplied by the
// caller, which keeps the harmony vivid and equiluminant rather than washed
// toward the cube's white/black corners.
const rybHueRotate = (
  hue: number,
  delta: number,
  cube?: ColorCube,
): number | undefined => {
  const angle = (((hue + delta) % 360) + 360) % 360;
  const [r, g, b] = rybHsl2rgb([angle, 1, 0.5], { cube });
  return oklch({
    mode: "rgb",
    r: clamp(r, 0, 1),
    g: clamp(g, 0, 1),
    b: clamp(b, 0, 1),
  })?.h;
};

export const harmonyRyb = (
  hex: string,
  kind: HarmonyKind,
  cubeKey = "itten",
): string[] => {
  if (kind === "monochrome" || kind === "shades") {
    return harmony(hex, kind);
  }
  const deltas = RYB_DELTAS[kind];
  const parsed = oklch(hex);
  if (!deltas || !parsed) return Array(COUNTS[kind]).fill(hex);
  const base: OKLCH = { l: parsed.l, c: parsed.c ?? 0, h: parsed.h ?? 0 };
  const cube = cubes.get(cubeKey)?.cube;
  const seedHue = hexToHsl(hex).h;
  return deltas.map((d) =>
    toHex({
      l: base.l,
      c: base.c,
      h: rybHueRotate(seedHue, d, cube) ?? base.h,
    }),
  );
};
