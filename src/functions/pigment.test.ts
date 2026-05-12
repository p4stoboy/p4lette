import { describe, expect, it } from "vitest";
import {
  PIGMENT_CUBES,
  cubeCorners,
  pigmentFilter,
  pigmentWheel,
} from "./pigment";
import { hexToHsl } from "./color_converters";

const PALETTE = ["#e3242b", "#2b6cb0", "#16a34a", "#f6ad55", "#1a202c"];
const isHex = (h: string): boolean => /^#[0-9a-f]{6}$/.test(h);

// total per-channel distance between two equal-length hex lists (0–765 per pair)
const dist = (a: string[], b: string[]): number => {
  const ch = (h: string): number[] => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  return a.reduce(
    (s, h, i) =>
      s + ch(h).reduce((t, c, j) => t + Math.abs(c - ch(b[i])[j]), 0),
    0,
  );
};

describe("PIGMENT_CUBES", () => {
  it("is a non-empty list of {key,label,meta} with valid rybitten keys", () => {
    expect(PIGMENT_CUBES.length).toBeGreaterThan(3);
    for (const c of PIGMENT_CUBES) {
      expect(typeof c.key).toBe("string");
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.meta).toMatch(/ · \d{3,4}$/);
    }
  });

  it("starts with itten (the default cube)", () => {
    expect(PIGMENT_CUBES[0].key).toBe("itten");
  });
});

describe("pigmentFilter", () => {
  it("→ same-length array of 6-digit hexes", () => {
    const out = pigmentFilter(PALETTE, "itten");
    expect(out).toHaveLength(PALETTE.length);
    for (const h of out) expect(isHex(h)).toBe(true);
  });

  it("[] → []", () => {
    expect(pigmentFilter([], "itten")).toEqual([]);
  });

  it("preserves lightness roughly — a dark colour stays dark, a light one light", () => {
    for (const cube of PIGMENT_CUBES.map((c) => c.key)) {
      for (const hex of PALETTE) {
        const before = hexToHsl(hex).l;
        const after = hexToHsl(pigmentFilter([hex], cube)[0]).l;
        expect(Math.abs(after - before)).toBeLessThan(22); // HSL L is 0–100
      }
    }
  });

  it("a pigment cube (goethe) shifts the palette further than the near-identity rgb cube", () => {
    expect(dist(pigmentFilter(PALETTE, "goethe"), PALETTE)).toBeGreaterThan(
      dist(pigmentFilter(PALETTE, "rgb"), PALETTE),
    );
  });

  it("different cubes give different results", () => {
    expect(pigmentFilter(PALETTE, "itten")).not.toEqual(
      pigmentFilter(PALETTE, "munsell"),
    );
  });

  it("an unknown cube key falls back to Itten (doesn't throw)", () => {
    expect(pigmentFilter(PALETTE, "no-such-cube")).toEqual(
      pigmentFilter(PALETTE, "itten"),
    );
  });
});

describe("pigmentWheel", () => {
  it.each([3, 7, 11])("n=%i → n valid hexes", (n) => {
    const out = pigmentWheel("itten", n);
    expect(out).toHaveLength(n);
    for (const h of out) expect(isHex(h)).toBe(true);
  });

  it("unknown cube key doesn't throw", () => {
    expect(pigmentWheel("no-such-cube", 5)).toHaveLength(5);
  });
});

describe("cubeCorners", () => {
  it("→ exactly 8 valid hexes", () => {
    const out = cubeCorners("itten");
    expect(out).toHaveLength(8);
    for (const h of out) expect(isHex(h)).toBe(true);
  });

  it("itten's first corner is light and its last is dark", () => {
    const corners = cubeCorners("itten");
    expect(hexToHsl(corners[0]).l).toBeGreaterThan(80);
    expect(hexToHsl(corners[7]).l).toBeLessThan(20);
  });

  it("unknown cube key falls back to Itten", () => {
    expect(cubeCorners("no-such-cube")).toEqual(cubeCorners("itten"));
  });
});
