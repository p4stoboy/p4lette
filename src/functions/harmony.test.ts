import { describe, expect, it } from "vitest";
import { hexToHsl } from "./color_converters";
import { HarmonyKind, harmony } from "./harmony";

const expectations: Record<HarmonyKind, number> = {
  complementary: 2,
  analogous: 3,
  triadic: 3,
  tetradic: 4,
  split: 3,
  monochrome: 5,
  shades: 3,
};

const BASE = "#aa6f3c"; // saturation/lum already inside the [5,95]/[8,92] clamps

describe("harmony", () => {
  it.each(Object.entries(expectations) as Array<[HarmonyKind, number]>)(
    "%s returns %i hexes",
    (kind, count) => {
      const result = harmony(BASE, kind);
      expect(result).toHaveLength(count);
      for (const h of result) {
        expect(h).toMatch(/^#[0-9a-f]{6}$/);
      }
    },
  );

  it("preserves the base color when the (0,0,0) delta is in range", () => {
    const triadic = harmony(BASE, "triadic");
    expect(triadic[0].toLowerCase()).toBe(BASE);
  });

  it("complementary rotates hue by ~180°", () => {
    const [a, b] = harmony(BASE, "complementary");
    const ha = hexToHsl(a).h;
    const hb = hexToHsl(b).h;
    const normalized = (((hb - ha) % 360) + 360) % 360;
    expect(Math.abs(normalized - 180)).toBeLessThan(2);
  });

  it("triadic spans three hues ~120° apart", () => {
    const [a, b, c] = harmony(BASE, "triadic");
    const hues = [a, b, c].map((h) => hexToHsl(h).h);
    const ab = (hues[1] - hues[0] + 360) % 360;
    const bc = (hues[2] - hues[1] + 360) % 360;
    expect(ab).toBeCloseTo(120, 0);
    expect(bc).toBeCloseTo(120, 0);
  });
});
