import { describe, expect, it } from "vitest";
import { oklch } from "culori";
import { TONE_METHODS, ToneMethod, tones } from "./tones";

const BASE = "#aa6f3c";
const METHODS: ToneMethod[] = ["ditto", "oklch", "hsv"];

describe("tones", () => {
  it("exposes one method descriptor per scale row, in order", () => {
    expect(TONE_METHODS.map((m) => m.id)).toEqual(METHODS);
    for (const m of TONE_METHODS) {
      expect(m.label).toMatch(/\S/);
      expect(m.caption).toMatch(/\S/);
    }
  });

  it.each(METHODS)("%s returns 11 valid hex strings", (method) => {
    const result = tones(BASE, method);
    expect(result).toHaveLength(11);
    for (const h of result) {
      expect(h).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it.each(METHODS)(
    "%s orders by descending lightness (lightest first)",
    (method) => {
      const ls = tones(BASE, method).map((h) => oklch(h)!.l);
      const sorted = [...ls].sort((a, b) => b - a);
      expect(ls).toEqual(sorted);
    },
  );

  it.each(METHODS)("%s spans a wide lightness range", (method) => {
    const ls = tones(BASE, method).map((h) => oklch(h)!.l);
    expect(Math.max(...ls) - Math.min(...ls)).toBeGreaterThan(0.6);
  });

  it.each(METHODS)(
    "%s includes a swatch near the seed's lightness",
    (method) => {
      const baseL = oklch(BASE)!.l;
      const dists = tones(BASE, method).map((h) =>
        Math.abs(oklch(h)!.l - baseL),
      );
      expect(Math.min(...dists)).toBeLessThan(0.15);
    },
  );
});
