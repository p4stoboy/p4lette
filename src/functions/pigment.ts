import { formatHex } from "culori";
import { rybHsl2rgb } from "rybitten";
import { RYB_ITTEN, cubes, type ColorCube } from "rybitten/cubes";
import { clamp, hexToHsl } from "./color_converters";

// rybitten's pigment "cubes" reinterpret colours through a chosen colour-theory
// model (Itten's wheel, Goethe's, Munsell's, …). Used here three ways: as a
// *filter* over the live palette (re-render each swatch's HSL through the cube —
// the painterly / print-like version), as the cube's own colour *wheel*, and as
// the cube's eight defining corner colours.

export interface PigmentCube {
  key: string;
  label: string;
  meta: string; // "<author> · <year>"
}

// A curated slice of the ~34 cubes rybitten ships — chromatic wheels first
// (itten is rybitten's default), the two modern reference cubes last.
const CURATED: readonly string[] = [
  "itten",
  "goethe",
  "runge",
  "chevreul",
  "munsell",
  "harris",
  "boutet",
  "cmy",
  "rgb",
];

const LABELS: Record<string, string> = {
  itten: "ITTEN",
  goethe: "GOETHE",
  runge: "RUNGE",
  chevreul: "CHEVREUL",
  munsell: "MUNSELL",
  harris: "HARRIS",
  boutet: "BOUTET",
  cmy: "CMY",
  rgb: "RGB",
};

export const PIGMENT_CUBES: readonly PigmentCube[] = CURATED.filter((k) =>
  cubes.has(k),
).map((k) => {
  const m = cubes.get(k)!;
  return {
    key: k,
    label: LABELS[k] ?? k.toUpperCase(),
    meta: `${m.author} · ${m.year}`,
  };
});

const cubeFor = (key: string): ColorCube => cubes.get(key)?.cube ?? RYB_ITTEN;

const toHex = ([r, g, b]: readonly [number, number, number]): string =>
  formatHex({
    mode: "rgb",
    r: clamp(r, 0, 1),
    g: clamp(g, 0, 1),
    b: clamp(b, 0, 1),
  }) ?? "#000000";

// Re-render each swatch through the cube: take its HSL, feed it as RYB-HSL
// (rybitten reads the hue on the painter's wheel) — lightness is preserved, the
// hue is reinterpreted and the chroma falls off the way that pigment system
// would mix it. With the `rgb` cube this is near-identity; with `goethe` /
// `munsell` / … it's the print-like shift.
export const pigmentFilter = (hexes: string[], cubeKey: string): string[] => {
  const cube = cubeFor(cubeKey);
  return hexes.map((hex) => {
    const { h, s, l } = hexToHsl(hex);
    return toHex(rybHsl2rgb([h, s / 100, l / 100], { cube }));
  });
};

// The cube's own colour wheel — `n` pigments swept around the RYB hue circle at
// full saturation / mid lightness (visibly *not* an sRGB wheel).
export const pigmentWheel = (cubeKey: string, n: number): string[] => {
  const cube = cubeFor(cubeKey);
  return Array.from({ length: n }, (_, i) =>
    toHex(rybHsl2rgb([(i / n) * 360, 1, 0.5], { cube })),
  );
};

// The eight corner colours that define the cube: white · red · yellow · orange ·
// blue · violet · green · black.
export const cubeCorners = (cubeKey: string): string[] =>
  cubeFor(cubeKey).map((c) => toHex(c));
