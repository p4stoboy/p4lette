import { describe, expect, it } from "vitest";
import { oklch } from "culori";
import { generatePalette } from "./generate_palette";

describe("generatePalette", () => {
  it.each([1, 2, 5, 8, 12])("returns %i valid hex strings", (n) => {
    const out = generatePalette(n);
    expect(out).toHaveLength(n);
    for (const h of out) {
      expect(h).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("returns [] for a non-positive count", () => {
    expect(generatePalette(0)).toEqual([]);
    expect(generatePalette(-3)).toEqual([]);
  });

  it("is deterministic given a fixed rng", () => {
    const fixed = () => 0.42;
    expect(generatePalette(6, fixed)).toEqual(generatePalette(6, fixed));
  });

  it("produces a coherent set, not per-slot noise: a real lightness span", () => {
    // sweep a few rng seeds so we're not banking on one lucky draw
    for (let seed = 0; seed < 8; seed++) {
      let i = 0;
      const rnd = () => {
        // simple deterministic pseudo-random sequence per seed
        i += 1;
        const x = Math.sin(seed * 1000 + i * 7.13) * 10000;
        return x - Math.floor(x);
      };
      const ls = generatePalette(6, rnd).map((h) => oklch(h)!.l);
      expect(Math.max(...ls) - Math.min(...ls)).toBeGreaterThan(0.3);
    }
  });

  it("two consecutive calls differ (SHUFFLE keeps producing fresh palettes)", () => {
    expect(generatePalette(5)).not.toEqual(generatePalette(5));
  });
});
