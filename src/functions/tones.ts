import { clampChroma, formatHex, oklch, parse } from "culori";
import { DittoTones } from "dittotones";
import { tailwindColors } from "./tones_tailwind_data";

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
      shades[step] = {
        l: parsed.l,
        c: parsed.c,
        h: parsed.h ?? 0,
      };
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

export const tones = (hex: string): string[] => {
  const result = dt.generate(hex);
  const entries = Object.entries(result.scale);
  // Tailwind shade keys ('50','100',...,'950') sort numerically: lightest → darkest
  entries.sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10));
  return entries.map(([, color]) => {
    const clamped = clampChroma(
      { mode: "oklch", l: color.l, c: color.c, h: color.h ?? 0 },
      "oklch",
    );
    return formatHex(clamped) ?? "#000000";
  });
};
