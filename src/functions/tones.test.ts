import { describe, expect, it } from "vitest";
import { oklch } from "culori";
import { TONE_METHODS, ToneMethod, tones, dittoMatch } from "./tones";

const BASE = "#aa6f3c";
const METHODS: ToneMethod[] = ["ditto", "oklch", "hsv", "gen"];

const isHex = (h: string): boolean => /^#[0-9a-f]{6}$/.test(h);

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
      expect(isHex(h)).toBe(true);
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

  it("hsv: distinct seeds give distinct scales (the curve tracks the seed)", () => {
    expect(tones("#3b82f6", "hsv")).not.toEqual(tones("#e11d48", "hsv"));
  });

  it("gen: distinct seeds give distinct scales", () => {
    expect(tones("#3b82f6", "gen")).not.toEqual(tones("#e11d48", "gen"));
  });
});

describe("dittoMatch", () => {
  it("reports the matched reference ramp/shade and method", () => {
    const m = dittoMatch(BASE);
    expect(m.shade).toMatch(/\S/);
    expect(["exact", "single", "blend"]).toContain(m.method);
  });
});
