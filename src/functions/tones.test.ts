import { describe, expect, it } from "vitest";
import { oklch } from "culori";
import { tones } from "./tones";

const BASE = "#aa6f3c";

describe("tones", () => {
  it("returns 11 valid hex strings", () => {
    const result = tones(BASE);
    expect(result).toHaveLength(11);
    for (const h of result) {
      expect(h).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("orders by ascending lightness (lightest first, darkest last)", () => {
    const result = tones(BASE);
    const ls = result.map((h) => oklch(h)!.l);
    const sorted = [...ls].sort((a, b) => b - a);
    expect(ls).toEqual(sorted);
  });

  it("spans a wide lightness range", () => {
    const result = tones(BASE);
    const ls = result.map((h) => oklch(h)!.l);
    expect(Math.max(...ls) - Math.min(...ls)).toBeGreaterThan(0.6);
  });

  it("scale contains a swatch near the input color", () => {
    const result = tones(BASE);
    const baseParsed = oklch(BASE)!;
    const distances = result.map((h) => {
      const p = oklch(h)!;
      return Math.abs((p.l ?? 0) - (baseParsed.l ?? 0));
    });
    expect(Math.min(...distances)).toBeLessThan(0.15);
  });
});
