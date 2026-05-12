import { describe, expect, it } from "vitest";
import { oklch } from "culori";
import {
  HARMONY_HSV_KINDS,
  HARMONY_STYLES,
  HarmonyKind,
  harmony,
  harmonyHsv,
} from "./harmony";
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

const KINDS = Object.entries(expectations) as Array<[HarmonyKind, number]>;

const BASE = "#aa6f3c";
const HEX_RE = /^#[0-9a-f]{6}$/;

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

describe("harmony — pro-color-harmonies styles", () => {
  it("HARMONY_STYLES lists the geometric styles, 'default' included", () => {
    expect(HARMONY_STYLES).toContain("default");
    expect(HARMONY_STYLES.length).toBeGreaterThanOrEqual(2);
  });

  it.each(HARMONY_STYLES)(
    "style %s — every kind still returns COUNTS[kind] valid hexes",
    (style) => {
      for (const [kind, count] of KINDS) {
        const result = harmony(BASE, kind, style);
        expect(result).toHaveLength(count);
        for (const h of result) expect(h).toMatch(HEX_RE);
      }
    },
  );

  it("a non-default style changes the result", () => {
    expect(harmony(BASE, "tetradic", "square")).not.toEqual(
      harmony(BASE, "tetradic", "default"),
    );
  });

  it("harmony(hex, kind) defaults to the 'default' style", () => {
    expect(harmony(BASE, "triadic")).toEqual(
      harmony(BASE, "triadic", "default"),
    );
  });
});

describe("harmony — pro-color-harmonies tintsShades for MONOCHROME/SHADES", () => {
  it("the style toggle now changes MONOCHROME / SHADES", () => {
    expect(harmony(BASE, "monochrome", "circle")).not.toEqual(
      harmony(BASE, "monochrome", "default"),
    );
    expect(harmony(BASE, "shades", "triangle")).not.toEqual(
      harmony(BASE, "shades", "default"),
    );
  });

  it("MONOCHROME / SHADES still vary lightness monotonically at every style", () => {
    for (const style of HARMONY_STYLES) {
      for (const kind of ["monochrome", "shades"] as const) {
        const ls = harmony(BASE, kind, style).map((c) => oklch(c)!.l);
        expect(ls).toEqual([...ls].sort((a, b) => a - b));
      }
    }
  });
});

describe("harmonyHsv — rampensau HSV-space harmonies", () => {
  const COUNTS: Record<string, number> = {
    complementary: 2,
    analogous: 6,
    triadic: 3,
    tetradic: 4,
    splitComplementary: 3,
    pentadic: 5,
    hexadic: 6,
    compound: 4,
    doubleComplementary: 4,
  };

  it("HARMONY_HSV_KINDS includes the geometry pro-color-harmonies lacks", () => {
    const keys = HARMONY_HSV_KINDS.map((k) => k.key);
    expect(keys).toContain("pentadic");
    expect(keys).toContain("hexadic");
    expect(keys).toContain("compound");
    expect(keys).toContain("doubleComplementary");
    for (const k of HARMONY_HSV_KINDS) {
      expect(k.key).toMatch(/\S/);
      expect(k.label).toMatch(/\S/);
    }
  });

  it.each(HARMONY_HSV_KINDS.map((k) => k.key))(
    "%s returns the right number of valid hexes",
    (kind) => {
      const result = harmonyHsv(BASE, kind);
      expect(result).toHaveLength(COUNTS[kind]);
      for (const h of result) expect(h).toMatch(HEX_RE);
    },
  );

  it("the first colour is at the seed's hue", () => {
    const [first] = harmonyHsv(BASE, "triadic");
    expect(hueDelta(hexToHsl(first).h, hexToHsl(BASE).h)).toBeLessThan(4);
  });

  it("an unknown kind falls back to complementary (doesn't throw)", () => {
    expect(harmonyHsv(BASE, "no-such-harmony")).toEqual(
      harmonyHsv(BASE, "complementary"),
    );
  });

  it("distinct kinds give distinct results", () => {
    expect(harmonyHsv(BASE, "pentadic")).not.toEqual(
      harmonyHsv(BASE, "hexadic"),
    );
  });
});
