import { clampChroma, formatHex, oklch, parse } from "culori";
import { DittoTones } from "dittotones";
import { generateRandomColorRamp } from "fettepalette";
import { generateColorRamp } from "rampensau";
import {
  clamp,
  hexToHsl,
  hexToHsv,
  hslToHex,
  hsvToHex,
} from "./color_converters";
import { tailwindColors } from "./tones_tailwind_data";

const STEPS = 11;

export type ToneMethod = "ditto" | "oklch" | "hsv" | "gen";

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
    caption: "curve through the HSV model via fettepalette — brighter mids",
  },
  {
    id: "gen",
    label: "GENERATIVE",
    caption: "single-hue sweep via rampensau — even hue, swept sat & lightness",
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

export interface DittoMatch {
  /** the dominant reference ramp + shade dittoTones matched, e.g. "amber-700" */
  shade: string;
  method: "exact" | "single" | "blend";
}

export const dittoMatch = (hex: string): DittoMatch => {
  const r = dt.generate(hex);
  const dominant = [...r.sources].sort((a, b) => b.weight - a.weight)[0];
  const ramp = dominant?.name ?? "neutral";
  return { shade: `${ramp}-${r.matchedShade}`, method: r.method };
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

// --- HSV-curve ramp via fettepalette: the lib's curve shape (hue held), value
//     range stretched so the scale always spans light → dark, chroma bowed ---
const fetteHsvScale = (hex: string): string[] => {
  const { h: seedH } = hexToHsv(hex);
  const ramp = generateRandomColorRamp({
    total: 5,
    centerHue: seedH,
    hueCycle: 0, // single hue — keep it a tone scale, not a rainbow
    curveMethod: "lamé",
    curveAccent: 0.2,
    offsetTint: 0.05,
    offsetShade: 0.05,
    tintShadeHueShift: 0,
    offsetCurveModTint: 0,
    offsetCurveModShade: 0,
    minSaturationLight: [0.3, 0.06],
    maxSaturationLight: [1, 0.96],
    colorModel: "hsv",
  });
  // each entry is [h, s, v]; fettepalette's offsets can push v slightly out of
  // [0,1] — clamp, then sort lightest → darkest by value.
  const vs = ramp.all.map(([, , v]) => clamp(v, 0, 1)).sort((a, b) => b - a);
  const sampleV = (t: number): number => {
    const p = t * (vs.length - 1);
    const lo = Math.floor(p);
    const hi = Math.min(lo + 1, vs.length - 1);
    return vs[lo] + (vs[hi] - vs[lo]) * (p - lo);
  };
  const raw = Array.from({ length: STEPS }, (_, i) => sampleV(i / (STEPS - 1)));
  const vMin = Math.min(...raw);
  const vMax = Math.max(...raw);
  const span = vMax - vMin || 1;
  const VHI = 0.99;
  const VLO = 0.1;
  const out = raw.map((v, i) => {
    const t = i / (STEPS - 1);
    const value = VLO + ((v - vMin) / span) * (VHI - VLO);
    const bell = Math.sin(Math.PI * t); // chroma bows to the mids
    return hsvToHex({
      h: seedH,
      s: 100 * (0.25 + 0.75 * bell),
      v: 100 * value,
    });
  });
  // guarantee a monotonic light → dark OKLCH ramp regardless of the curve
  return out.sort((a, b) => (oklch(b)?.l ?? 0) - (oklch(a)?.l ?? 0));
};

// --- generative single-hue sweep via rampensau: one hue, S & L swept across
//     the lib's ramp; re-sorted light → dark like the HSV scale ---
const genScale = (hex: string): string[] => {
  const { h, s } = hexToHsl(hex);
  const sat = clamp(s / 100, 0.15, 0.95);
  const ramp = generateColorRamp({
    total: STEPS,
    hStart: h,
    hCycles: 0, // single hue — a tone scale, not a rainbow
    sRange: [sat * 0.55, sat],
    lRange: [0.12, 0.97],
  });
  const out = ramp.map(([hh, ss, ll]) =>
    hslToHex({ h: hh, s: ss * 100, l: ll * 100 }),
  );
  return out.sort((a, b) => (oklch(b)?.l ?? 0) - (oklch(a)?.l ?? 0));
};

const SCALERS: Record<ToneMethod, (hex: string) => string[]> = {
  ditto: dittoScale,
  oklch: oklchScale,
  hsv: fetteHsvScale,
  gen: genScale,
};

export const tones = (hex: string, method: ToneMethod): string[] =>
  SCALERS[method](hex);
