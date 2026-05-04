import { clamp, hexToHsl, hslToHex } from "./color_converters";

export type HarmonyKind =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "split"
  | "monochrome"
  | "shades";

type Delta = readonly [number, number, number];

const PRESETS: Record<HarmonyKind, readonly Delta[]> = {
  complementary: [
    [0, 0, 0],
    [180, 0, 0],
  ],
  analogous: [
    [-30, 0, 0],
    [0, 0, 0],
    [30, 0, 0],
  ],
  triadic: [
    [0, 0, 0],
    [120, 0, 0],
    [240, 0, 0],
  ],
  tetradic: [
    [0, 0, 0],
    [90, 0, 0],
    [180, 0, 0],
    [270, 0, 0],
  ],
  split: [
    [0, 0, 0],
    [150, 0, 0],
    [210, 0, 0],
  ],
  monochrome: [
    [0, 0, -30],
    [0, 0, -15],
    [0, 0, 0],
    [0, 0, 15],
    [0, 0, 30],
  ],
  shades: [
    [0, 0, -25],
    [0, 0, 0],
    [0, 0, 25],
  ],
};

export const harmony = (hex: string, kind: HarmonyKind): string[] => {
  const { h, s, l } = hexToHsl(hex);
  return PRESETS[kind].map(([dh, ds, dl]) =>
    hslToHex({
      h: h + dh,
      s: clamp(s + ds, 5, 95),
      l: clamp(l + dl, 8, 92),
    }),
  );
};
