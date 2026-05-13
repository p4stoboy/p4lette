import { hexToOkhsl } from "./color_converters";
import { contrast } from "./contrast";

export interface PaletteStats {
  /** mean Okhsl lightness, 0–100 (%) */
  avgLightness: number;
  /** angular spread of hues, 0–360 (°) — the smallest arc containing every hue */
  hueSpreadDeg: number;
  warmCount: number;
  coolCount: number;
  /** hex with the highest Okhsl saturation */
  mostSaturated: string;
  /** hex with the lowest Okhsl saturation */
  leastSaturated: string;
  /** the lowest-contrast pair in the palette (ratio 1–21; `{1,"",""}` for ≤1 colour) */
  worstContrast: { ratio: number; a: string; b: string };
}

// Warm = reds / oranges / yellows / magentas (Okhsl hue near 0°); cool = the
// greens / cyans / blues / violets in between. A rough split — it's a "vibe" stat.
const isWarm = (hue: number): boolean => hue < 60 || hue >= 300;

// Smallest arc (degrees) that contains every hue in `hues`. 0 for ≤1 hue or when
// they're all equal; handles wrap-around (e.g. 350° and 10° → spread 20°).
const hueSpread = (hues: number[]): number => {
  if (hues.length < 2) return 0;
  const sorted = [...hues].sort((a, b) => a - b);
  let widestGap = 360 - sorted[sorted.length - 1] + sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    widestGap = Math.max(widestGap, sorted[i] - sorted[i - 1]);
  }
  return 360 - widestGap;
};

// "Palette at a glance" — averages and extremes derived purely from the hexes.
export const paletteStats = (hexes: string[]): PaletteStats => {
  const colors = hexes.map((hex) => ({ hex, ...hexToOkhsl(hex) }));

  const avgLightness = colors.length
    ? (colors.reduce((s, c) => s + c.l, 0) / colors.length) * 100
    : 0;

  // achromatic colours (s ≈ 0) have no meaningful hue — drop them from the spread
  const hueSpreadDeg = hueSpread(
    colors.filter((c) => c.s > 0.02).map((c) => c.h),
  );

  let warmCount = 0;
  let coolCount = 0;
  for (const c of colors) {
    if (isWarm(c.h)) warmCount++;
    else coolCount++;
  }

  const bySat = [...colors].sort((a, b) => b.s - a.s);
  const mostSaturated = bySat[0]?.hex ?? "";
  const leastSaturated = bySat[bySat.length - 1]?.hex ?? "";

  let worstContrast = { ratio: Infinity, a: "", b: "" };
  for (let i = 0; i < hexes.length; i++) {
    for (let j = i + 1; j < hexes.length; j++) {
      const ratio = contrast(hexes[i], hexes[j]);
      if (ratio < worstContrast.ratio) {
        worstContrast = { ratio, a: hexes[i], b: hexes[j] };
      }
    }
  }
  if (!Number.isFinite(worstContrast.ratio)) {
    worstContrast = { ratio: 1, a: hexes[0] ?? "", b: hexes[0] ?? "" };
  }

  return {
    avgLightness,
    hueSpreadDeg,
    warmCount,
    coolCount,
    mostSaturated,
    leastSaturated,
    worstContrast,
  };
};
