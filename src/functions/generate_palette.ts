import { Poline } from "poline";
import {
  generateColorRamp,
  generateColorRampParams,
  generateColorRampWithCurve,
} from "rampensau";
import { hslToHex, randomHex } from "./color_converters";

// Three ways to make a *coherent* palette of `count` colours. `rampensau`
// sweeps a single hue arc with a perceptual light→dark progression; `poline`
// interpolates between two anchor colours on a colour sphere; `random` is the
// incoherent escape hatch. Used by SHUFFLE and the initial seed.

export type GenStrategy = "rampensau" | "poline" | "random";

export const GEN_STRATEGIES: readonly { key: GenStrategy; label: string }[] = [
  { key: "rampensau", label: "RAMPENSAU SWEEP" },
  { key: "poline", label: "POLINE ANCHORS" },
  { key: "random", label: "PLAIN RANDOM" },
];

// The knobs the "tune the ramp" panel exposes for the rampensau strategy.
// 0–1 for saturation/lightness; `hueSpan` is |hCycles|; `curveAccent` shapes
// the lamé curve.
export interface RampParams {
  sLo: number;
  sHi: number;
  lLo: number;
  lHi: number;
  hueSpan: number;
  curveAccent: number;
}

// Slider config (default / min / max / step) lifted straight from rampensau's
// own `generateColorRampParams` metadata — so the panel mirrors the library.
export const RAMP_PARAM_META: Record<
  keyof RampParams,
  { default: number; min: number; max: number; step: number }
> = {
  sLo: {
    default: generateColorRampParams.minSaturation.default,
    ...generateColorRampParams.minSaturation.props,
  },
  sHi: {
    default: generateColorRampParams.maxSaturation.default,
    ...generateColorRampParams.maxSaturation.props,
  },
  lLo: {
    default: generateColorRampParams.minLight.default,
    ...generateColorRampParams.minLight.props,
  },
  lHi: {
    default: generateColorRampParams.maxLight.default,
    ...generateColorRampParams.maxLight.props,
  },
  hueSpan: {
    default: Math.abs(generateColorRampParams.hCycles.default),
    min: 0,
    max: generateColorRampParams.hCycles.props.max,
    step: generateColorRampParams.hCycles.props.step,
  },
  curveAccent: {
    default: generateColorRampParams.curveAccent.default,
    ...generateColorRampParams.curveAccent.props,
  },
};

export const defaultRampParams = (): RampParams => ({
  sLo: RAMP_PARAM_META.sLo.default,
  sHi: RAMP_PARAM_META.sHi.default,
  lLo: RAMP_PARAM_META.lLo.default,
  lHi: RAMP_PARAM_META.lHi.default,
  hueSpan: RAMP_PARAM_META.hueSpan.default,
  curveAccent: RAMP_PARAM_META.curveAccent.default,
});

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

// Evenly resample a hex list to exactly `count` entries (picks evenly-spaced
// indices — fine for an already-smooth path like a poline run).
const resampleHexList = (hexes: string[], count: number): string[] => {
  if (hexes.length === 0) return Array(count).fill("#000000");
  if (count <= 1) return [hexes[Math.floor(hexes.length / 2)]];
  return Array.from(
    { length: count },
    (_, i) => hexes[Math.round((i / (count - 1)) * (hexes.length - 1))],
  );
};

const rampensauPalette = (
  count: number,
  rnd: () => number,
  params?: RampParams,
): string[] => {
  const sLo = clamp01(params ? params.sLo : 0.4 + rnd() * 0.2);
  const sHi = clamp01(params ? params.sHi : 0.72 + rnd() * 0.18);
  const lLo = clamp01(params ? params.lLo : 0.18 + rnd() * 0.12);
  const lHi = clamp01(params ? params.lHi : 0.8 + rnd() * 0.1);
  const span = params ? Math.abs(params.hueSpan) : 0.2 + rnd() * 0.8;
  const args = {
    total: count,
    hStart: rnd() * 360,
    // |hCycles| in [0.2, 1.0] by default (tight analogous sweep → full wheel);
    // sign just reverses direction.
    hCycles: span * (rnd() < 0.5 ? 1 : -1),
    sRange: [Math.min(sLo, sHi), Math.max(sLo, sHi)] as [number, number],
    lRange: [Math.min(lLo, lHi), Math.max(lLo, lHi)] as [number, number],
  };
  const ramp = params
    ? generateColorRampWithCurve({
        ...args,
        curveMethod: "lamé",
        curveAccent: params.curveAccent,
      })
    : generateColorRamp(args);
  return ramp.map(([h, s, l]) => hslToHex({ h, s: s * 100, l: l * 100 }));
};

const polinePalette = (count: number, rnd: () => number): string[] => {
  const anchor = (): [number, number, number] => [
    rnd() * 360,
    0.5 + rnd() * 0.35,
    0.3 + rnd() * 0.45,
  ];
  const poline = new Poline({
    numPoints: Math.max(count, 2),
    anchorColors: [anchor(), anchor()],
  });
  const hexes = poline.colors.map(([h, s, l]) =>
    hslToHex({ h, s: s * 100, l: l * 100 }),
  );
  return resampleHexList(hexes, count);
};

export const generatePalette = (
  count: number,
  strategy: GenStrategy = "rampensau",
  rnd: () => number = Math.random,
  params?: RampParams,
): string[] => {
  if (count <= 0) return [];
  if (strategy === "poline") return polinePalette(count, rnd);
  if (strategy === "random")
    return Array.from({ length: count }, () => randomHex());
  return rampensauPalette(count, rnd, params);
};
