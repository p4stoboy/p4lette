import { generateColorRamp } from "rampensau";
import { hslToHex } from "./color_converters";

/**
 * Generate a *coherent* palette of `count` colours — a smooth ramp through a
 * single hue arc with a perceptual light→dark progression — rather than
 * `count` independent random colours. Used by SHUFFLE and the initial seed.
 *
 * Every call randomises the ramp parameters (within tasteful bounds) so
 * repeated shuffles keep producing fresh palettes. Pass a deterministic `rnd`
 * for reproducible output.
 */
export const generatePalette = (
  count: number,
  rnd: () => number = Math.random,
): string[] => {
  if (count <= 0) return [];
  const sLo = 0.4 + rnd() * 0.2;
  const sHi = 0.72 + rnd() * 0.18;
  const lLo = 0.18 + rnd() * 0.12;
  const lHi = 0.8 + rnd() * 0.1;
  const ramp = generateColorRamp({
    total: count,
    hStart: rnd() * 360,
    // |hCycles| in [0.2, 1.0]: from a tight analogous sweep to a full wheel,
    // always a continuous (coherent) hue progression. Sign just reverses it.
    hCycles: (0.2 + rnd() * 0.8) * (rnd() < 0.5 ? 1 : -1),
    sRange: [sLo, sHi],
    lRange: [lLo, lHi],
  });
  return ramp.map(([h, s, l]) => hslToHex({ h, s: s * 100, l: l * 100 }));
};
