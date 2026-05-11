import { clampChroma, formatHex, oklch, parse } from "culori";
import { DittoTones } from "dittotones";
import { clamp, hexToHsv, hsvToHex } from "./color_converters";
import { tailwindColors } from "./tones_tailwind_data";

const STEPS = 11;

export type ToneMethod = "ditto" | "oklch" | "hsv";

export interface ToneMethodInfo {
  id: ToneMethod;
  label: string;
  caption: string;
}

export const TONE_METHODS: readonly ToneMethodInfo[] = [
  {
    id: "ditto",
    label: "DITTOTONES",
    caption: "perceptual scale blended from Tailwind v4 reference ramps",
  },
  {
    id: "oklch",
    label: "OKLCH RAMP",
    caption: "perceptually-even lightness; hue held, chroma bowed to the mids",
  },
  {
    id: "hsv",
    label: "HSV CURVE",
    caption: "value curve through the HSV model — brighter, richer mids",
  },
];

const toHexOklch = (l: number, c: number, h: number): string =>
  formatHex(clampChroma({ mode: "oklch", l, c, h }, "oklch")) ?? "#000000";

// --- dittoTones: blend against the Tailwind v4 OKLCH reference ramps ---
const buildRamps = (): Map<
  string,
  Record<string, { l: number; c: number; h: number }>
> => {
  const ramps = new Map<
    string,
    Record<string, { l: number; c: number; h: number }>
  >();
  for (const [name, ramp] of Object.entries(tailwindColors)) {
    const shades: Record<string, { l: number; c: number; h: number }> = {};
    for (const [step, colorStr] of Object.entries(ramp)) {
      const parsed = oklch(parse(colorStr));
      if (!parsed) continue;
      shades[step] = { l: parsed.l, c: parsed.c, h: parsed.h ?? 0 };
    }
    ramps.set(name, shades);
  }
  return ramps;
};

const dt = new DittoTones({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ramps: buildRamps() as any,
  gamutMap: true,
});

const dittoScale = (hex: string): string[] => {
  const entries = Object.entries(dt.generate(hex).scale);
  // Tailwind shade keys ('50','100',...,'950') sort numerically: lightest → darkest
  entries.sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10));
  return entries.map(([, c]) => toHexOklch(c.l, c.c, c.h ?? 0));
};

// --- plain perceptual OKLCH ramp: even lightness, hue held, chroma bowed ---
const oklchScale = (hex: string): string[] => {
  const parsed = oklch(hex);
  if (!parsed) return Array(STEPS).fill(hex);
  const h = parsed.h ?? 0;
  const baseC = parsed.c ?? 0;
  const Lmax = 0.97;
  const Lmin = 0.13;
  return Array.from({ length: STEPS }, (_, i) => {
    const t = i / (STEPS - 1); // 0 lightest .. 1 darkest
    const l = Lmax - t * (Lmax - Lmin);
    const bell = Math.sin(Math.PI * t); // 0 at the ends, 1 at the centre
    return toHexOklch(l, baseC * (0.2 + 0.8 * bell), h);
  });
};

// --- HSV value curve: smoothstep on value, saturation ramped light → dark ---
const smoothstep = (t: number): number => t * t * (3 - 2 * t);

const hsvScale = (hex: string): string[] => {
  const { h, s } = hexToHsv(hex); // s in 0..100
  const Vmax = 98;
  const Vmin = 14;
  return Array.from({ length: STEPS }, (_, i) => {
    const t = i / (STEPS - 1);
    const v = Vmax - smoothstep(t) * (Vmax - Vmin);
    const sat = clamp(s * (0.25 + 0.75 * t), 0, 100);
    return hsvToHex({ h, s: sat, v });
  });
};

const SCALERS: Record<ToneMethod, (hex: string) => string[]> = {
  ditto: dittoScale,
  oklch: oklchScale,
  hsv: hsvScale,
};

export const tones = (hex: string, method: ToneMethod): string[] =>
  SCALERS[method](hex);
