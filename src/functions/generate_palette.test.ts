import { describe, expect, it } from "vitest";
import { oklch } from "culori";
import {
  GEN_STRATEGIES,
  GenStrategy,
  RAMP_PARAM_META,
  defaultRampParams,
  generatePalette,
} from "./generate_palette";

const STRATEGIES: GenStrategy[] = ["default", "rampensau", "poline", "random"];
const isHex = (h: string): boolean => /^#[0-9a-f]{6}$/.test(h);

describe("generatePalette", () => {
  it.each([1, 2, 5, 8, 12])(
    "returns %i valid hex strings (default strategy)",
    (n) => {
      const out = generatePalette(n);
      expect(out).toHaveLength(n);
      for (const h of out) expect(isHex(h)).toBe(true);
    },
  );

  it.each(STRATEGIES)(
    "strategy %s returns the right count of valid hexes",
    (s) => {
      for (const n of [1, 2, 5, 9]) {
        const out = generatePalette(n, s);
        expect(out).toHaveLength(n);
        for (const h of out) expect(isHex(h)).toBe(true);
      }
    },
  );

  it("returns [] for a non-positive count, any strategy", () => {
    for (const s of STRATEGIES) {
      expect(generatePalette(0, s)).toEqual([]);
      expect(generatePalette(-3, s)).toEqual([]);
    }
  });

  it("is deterministic given a fixed rng (rampensau)", () => {
    const fixed = () => 0.42;
    expect(generatePalette(6, "rampensau", fixed)).toEqual(
      generatePalette(6, "rampensau", fixed),
    );
  });

  it("rampensau params are respected — saturation band, and changing them changes the output", () => {
    const fixed = () => 0.37;
    const grey = generatePalette(8, "rampensau", fixed, {
      ...defaultRampParams(),
      sLo: 0,
      sHi: 0.04,
    });
    for (const hex of grey) expect(oklch(hex)!.c ?? 0).toBeLessThan(0.06);

    const vivid = generatePalette(8, "rampensau", fixed, {
      ...defaultRampParams(),
      sLo: 0.85,
      sHi: 0.95,
    });
    expect(Math.max(...vivid.map((h) => oklch(h)!.c ?? 0))).toBeGreaterThan(
      0.06,
    );
    expect(vivid).not.toEqual(grey);
  });

  it("RAMP_PARAM_META mirrors rampensau's own slider metadata shape", () => {
    for (const k of Object.keys(defaultRampParams()) as Array<
      keyof ReturnType<typeof defaultRampParams>
    >) {
      const m = RAMP_PARAM_META[k];
      expect(typeof m.default).toBe("number");
      expect(m.min).toBeLessThanOrEqual(m.max);
      expect(m.step).toBeGreaterThan(0);
    }
  });

  it("produces a coherent set, not per-slot noise: a real lightness span", () => {
    for (let seed = 0; seed < 8; seed++) {
      let i = 0;
      const rnd = () => {
        i += 1;
        const x = Math.sin(seed * 1000 + i * 7.13) * 10000;
        return x - Math.floor(x);
      };
      const ls = generatePalette(6, "rampensau", rnd).map((h) => oklch(h)!.l);
      expect(Math.max(...ls) - Math.min(...ls)).toBeGreaterThan(0.3);
    }
  });

  it("two consecutive calls differ (SHUFFLE keeps producing fresh palettes)", () => {
    expect(generatePalette(5)).not.toEqual(generatePalette(5));
    expect(generatePalette(5, "poline")).not.toEqual(
      generatePalette(5, "poline"),
    );
  });

  it("'default' strategy is the unparameterised rampensau sweep", () => {
    const fixed = () => 0.31;
    expect(generatePalette(7, "default", fixed)).toEqual(
      generatePalette(7, "rampensau", fixed),
    );
  });

  it("GEN_STRATEGIES lists the four strategies, 'default' first", () => {
    expect(GEN_STRATEGIES.map((s) => s.key)).toEqual(STRATEGIES);
    expect(GEN_STRATEGIES[0].key).toBe("default");
    for (const s of GEN_STRATEGIES) expect(s.label).toMatch(/\S/);
  });
});
