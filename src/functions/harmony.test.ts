import { describe, expect, it } from "vitest";
import { oklch } from "culori";
import { HarmonyKind, harmony, harmonyRyb } from "./harmony";
import { hexToHsl } from "./color_converters";

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

describe("harmonyRyb", () => {
  it.each(Object.entries(expectations) as Array<[HarmonyKind, number]>)(
    "%s returns %i valid hex strings",
    (kind, count) => {
      const result = harmonyRyb(BASE, kind);
      expect(result).toHaveLength(count);
      for (const h of result) {
        expect(h).toMatch(/^#[0-9a-f]{6}$/);
      }
    },
  );

  it("complementary of red lands in the green family (Itten)", () => {
    const [, comp] = harmonyRyb("#ff0000", "complementary");
    const { h } = hexToHsl(comp);
    // Itten complement of red sits between green (120°) and cyan (180°);
    // crucially not red-orange (0–60°) and not magenta (300°+).
    expect(h).toBeGreaterThan(90);
    expect(h).toBeLessThan(200);
  });

  it("triadic of red includes blue-ish and yellow-ish on Itten wheel", () => {
    const [, two, three] = harmonyRyb("#ff0000", "triadic");
    // Itten triadic of red: yellow (~60°) and blue (~240°)
    const hues = [two, three].map((h) => hexToHsl(h).h).sort((a, b) => a - b);
    expect(hues[0]).toBeLessThan(120);
    expect(hues[1]).toBeGreaterThan(180);
  });

  const ROTATION_KINDS: HarmonyKind[] = [
    "analogous",
    "complementary",
    "triadic",
    "tetradic",
    "split",
  ];

  it("hue-rotation harmonies stay at the seed's lightness (no washout)", () => {
    // The RYB toggle only rotates hue on the painter's wheel; it must not drag
    // swatches toward white/black the way the raw rybitten cube roundtrip did.
    const seeds = ["#e3242b", "#2b6cb0", "#1a202c", "#cbd5e0", "#f6ad55"];
    for (const seed of seeds) {
      const seedL = oklch(seed)!.l;
      for (const kind of ROTATION_KINDS) {
        for (const h of harmonyRyb(seed, kind)) {
          expect(Math.abs(oklch(h)!.l - seedL)).toBeLessThan(0.05);
        }
      }
    }
  });

  it("hue-rotation harmonies carry the seed's chroma, not a muddy roundtrip", () => {
    const seed = "#2b6cb0";
    const seedC = oklch(seed)!.c!;
    for (const kind of ROTATION_KINDS) {
      for (const h of harmonyRyb(seed, kind)) {
        expect(oklch(h)!.c ?? 0).toBeGreaterThan(seedC * 0.7);
      }
    }
  });
});
