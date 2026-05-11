import { clampChroma, formatHex, oklch } from "culori";
import { ColorPaletteGenerator } from "pro-color-harmonies";
import { rybHsl2rgb } from "rybitten";
import { clamp, hexToHsl, rgbToHex } from "./color_converters";

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

export const harmony = (hex: string, kind: HarmonyKind): string[] => {
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
  const full = ColorPaletteGenerator.generate(base, libKind, {
    style: "default",
  });
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

const rybRotate = (h: number, s: number, l: number, delta: number): string => {
  const newH = (((h + delta) % 360) + 360) % 360;
  const [r, g, b] = rybHsl2rgb([newH, s, l]);
  return rgbToHex({
    r: clamp(r * 255, 0, 255),
    g: clamp(g * 255, 0, 255),
    b: clamp(b * 255, 0, 255),
  });
};

export const harmonyRyb = (hex: string, kind: HarmonyKind): string[] => {
  if (kind === "monochrome" || kind === "shades") {
    return harmony(hex, kind);
  }
  const deltas = RYB_DELTAS[kind];
  if (!deltas) return Array(COUNTS[kind]).fill(hex);
  const { h, s, l } = hexToHsl(hex);
  const sNorm = clamp(s, 0, 100) / 100;
  const lNorm = clamp(l, 0, 100) / 100;
  return deltas.map((d) => rybRotate(h, sNorm, lNorm, d));
};
