import { describe, expect, it } from "vitest";
import { oklch } from "culori";
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

const BASE = "#aa6f3c";

const hueDelta = (a: number, b: number): number => {
  const d = (((b - a) % 360) + 360) % 360;
  return d > 180 ? 360 - d : d;
};

describe("harmony", () => {
  it.each(Object.entries(expectations) as Array<[HarmonyKind, number]>)(
    "%s returns %i valid hex strings",
    (kind, count) => {
      const result = harmony(BASE, kind);
      expect(result).toHaveLength(count);
      for (const h of result) {
        expect(h).toMatch(/^#[0-9a-f]{6}$/);
      }
    },
  );

  it("complementary rotates OKLCH hue by ~180°", () => {
    const [a, b] = harmony(BASE, "complementary");
    const ha = oklch(a)!.h!;
    const hb = oklch(b)!.h!;
    expect(hueDelta(ha, hb)).toBeGreaterThan(170);
  });

  it("triadic spreads OKLCH hues with every pair >100° apart", () => {
    const [a, b, c] = harmony(BASE, "triadic");
    const hues = [a, b, c].map((h) => oklch(h)!.h!);
    expect(hueDelta(hues[0], hues[1])).toBeGreaterThan(100);
    expect(hueDelta(hues[1], hues[2])).toBeGreaterThan(100);
    expect(hueDelta(hues[0], hues[2])).toBeGreaterThan(100);
  });

  it("tetradic spreads OKLCH hues with adjacent pairs >70° apart", () => {
    const colors = harmony(BASE, "tetradic");
    const hues = colors.map((h) => oklch(h)!.h!);
    for (let i = 0; i < hues.length; i++) {
      for (let j = i + 1; j < hues.length; j++) {
        expect(hueDelta(hues[i], hues[j])).toBeGreaterThan(40);
      }
    }
  });

  it("monochrome holds hue and chroma, varies lightness monotonically", () => {
    const colors = harmony(BASE, "monochrome");
    const baseParsed = oklch(BASE)!;
    const lightnesses = colors.map((c) => oklch(c)!.l);
    for (const c of colors) {
      const parsed = oklch(c)!;
      if ((parsed.c ?? 0) > 0.001 && parsed.h !== undefined) {
        expect(hueDelta(baseParsed.h!, parsed.h)).toBeLessThan(2);
      }
    }
    const sorted = [...lightnesses].sort((x, y) => x - y);
    expect(lightnesses).toEqual(sorted);
  });

  it("shades varies lightness monotonically", () => {
    const colors = harmony(BASE, "shades");
    const ls = colors.map((c) => oklch(c)!.l);
    const sorted = [...ls].sort((a, b) => a - b);
    expect(ls).toEqual(sorted);
  });
});
