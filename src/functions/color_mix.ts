import { formatHex, interpolate, parse, samples, toGamut } from "culori";

// MIX — interpolate between two swatches in a chosen colour space, with an
// optional sample-distribution easing (the "curve"). Two stops, so a polynomial
// spline would be pointless; the only real degree of freedom besides the space
// is where the N samples land along the path, which `MixCurve` controls.

export type MixSpace = "oklch" | "lab" | "hsl";

export const MIX_SPACES: readonly { key: MixSpace; label: string }[] = [
  { key: "oklch", label: "OKLCH" },
  { key: "lab", label: "LAB" },
  { key: "hsl", label: "HSL" },
];

export const MIX_STEPS: readonly number[] = [3, 5, 7, 9, 11];

export type MixCurve = "even" | "ease-from" | "ease-to";

export const MIX_CURVES: readonly { key: MixCurve; label: string }[] = [
  { key: "even", label: "EVEN" },
  { key: "ease-from", label: "EASE FROM" },
  { key: "ease-to", label: "EASE TO" },
];

// γ on the sample parameter: >1 bunches steps toward FROM, <1 toward TO.
const GAMMA: Record<MixCurve, number> = {
  even: 1,
  "ease-from": 1.8,
  "ease-to": 0.55,
};

export const mixSteps = (
  a: string,
  b: string,
  n: number,
  space: MixSpace,
  curve: MixCurve,
): string[] => {
  const okA = !!parse(a);
  const okB = !!parse(b);
  if (!okA || !okB) {
    const fallback = okA ? a : okB ? b : "#000000";
    return Array(n).fill(fallback);
  }
  // `lab` has no hue channel; the hue spaces (`oklch`/`hsl`) take the shortest
  // arc — culori's default fixup for `interpolate` already does this.
  const itp = interpolate([a, b], space);
  const g = GAMMA[curve];
  return samples(n).map((t) => formatHex(itp(Math.pow(t, g))) ?? a);
};

// --- single-step OKLab interpolation — the "insert between" affordance ---

const intoSrgb = toGamut("rgb", "oklch");

// The OKLab `t`-point between two hexes (`t=0.5` = the Coolors-style midpoint);
// gamut-clamped into sRGB. Bad input falls back to the parsable one (or black).
export const mixHex = (a: string, b: string, t = 0.5): string => {
  if (!parse(a)) return parse(b) ? b : "#000000";
  if (!parse(b)) return a;
  return formatHex(intoSrgb(interpolate([a, b], "oklab")(t))) ?? a;
};

// Step `t` of a unit *past* `anchor`, away from `neighbor`, in OKLab — so it
// continues a ramp past its endpoint — gamut-clamped into sRGB. (`interpolate`
// at parameter `1 + t` overshoots the `neighbor → anchor` segment by `t`.)
export const extrapolateHex = (
  anchor: string,
  neighbor: string,
  t = 0.6,
): string => {
  if (!parse(anchor)) return parse(neighbor) ? neighbor : "#000000";
  if (!parse(neighbor)) return anchor;
  return (
    formatHex(intoSrgb(interpolate([neighbor, anchor], "oklab")(1 + t))) ??
    anchor
  );
};
