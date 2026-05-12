import { describe, expect, it } from "vitest";
import { oklch, wcagLuminance } from "culori";
import {
  BLEND_MODES,
  CvdType,
  EFFECTS,
  applyEffect,
  blendWith,
  simulateCvd,
  snapToGamut,
} from "./color_filters";

const PALETTE = ["#e3242b", "#2b6cb0", "#16a34a", "#f6ad55", "#1a202c"];
const TYPES: CvdType[] = ["prot", "deuter", "trit"];
const isHex = (h: string): boolean => /^#[0-9a-f]{6}$/.test(h);

describe("simulateCvd", () => {
  it.each(TYPES)("%s → same-length array of 6-digit hexes", (type) => {
    const out = simulateCvd(PALETTE, type);
    expect(out).toHaveLength(PALETTE.length);
    for (const h of out) expect(isHex(h)).toBe(true);
  });

  it("changes a colour that's hard to discriminate for that deficiency", () => {
    expect(simulateCvd(["#ff0000"], "prot")[0]).not.toBe("#ff0000");
    expect(simulateCvd(["#ff0000"], "deuter")[0]).not.toBe("#ff0000");
  });

  it("[] → []", () => {
    expect(simulateCvd([], "prot")).toEqual([]);
  });
});

describe("snapToGamut", () => {
  it("→ same-length array of 6-digit hexes", () => {
    const out = snapToGamut(PALETTE);
    expect(out).toHaveLength(PALETTE.length);
    for (const h of out) expect(isHex(h)).toBe(true);
  });

  it("is a no-op on an already-displayable palette", () => {
    expect(snapToGamut(PALETTE)).toEqual(PALETTE);
  });

  it("is idempotent", () => {
    const once = snapToGamut(PALETTE);
    expect(snapToGamut(once)).toEqual(once);
  });

  it("[] → []", () => {
    expect(snapToGamut([])).toEqual([]);
  });
});

describe("applyEffect", () => {
  it.each(EFFECTS.map((e) => e.key))(
    "%s → same-length array of 6-digit hexes",
    (key) => {
      const out = applyEffect(PALETTE, key);
      expect(out).toHaveLength(PALETTE.length);
      for (const h of out) expect(isHex(h)).toBe(true);
    },
  );

  it("grayscale produces near-achromatic colours", () => {
    for (const h of applyEffect(PALETTE, "grayscale")) {
      expect(oklch(h)!.c ?? 0).toBeLessThan(0.02);
    }
  });

  it("invert is involutive", () => {
    expect(applyEffect(applyEffect(PALETTE, "invert"), "invert")).toEqual(
      PALETTE,
    );
  });

  it("an unknown effect key leaves the palette unchanged", () => {
    expect(applyEffect(PALETTE, "no-such-effect")).toEqual(PALETTE);
  });

  it("[] → []", () => {
    expect(applyEffect([], "grayscale")).toEqual([]);
  });
});

describe("blendWith", () => {
  it.each(BLEND_MODES)("%s → same-length array of 6-digit hexes", (mode) => {
    const out = blendWith(PALETTE, "#808080", mode);
    expect(out).toHaveLength(PALETTE.length);
    for (const h of out) expect(isHex(h)).toBe(true);
  });

  it("multiply against mid-grey darkens every swatch", () => {
    const out = blendWith(PALETTE, "#808080", "multiply");
    out.forEach((h, i) => {
      expect(wcagLuminance(h)).toBeLessThanOrEqual(wcagLuminance(PALETTE[i]));
    });
  });

  it("screen against mid-grey lightens every swatch", () => {
    const out = blendWith(PALETTE, "#808080", "screen");
    out.forEach((h, i) => {
      expect(wcagLuminance(h)).toBeGreaterThanOrEqual(
        wcagLuminance(PALETTE[i]),
      );
    });
  });

  it("an unparsable `over` colour leaves the palette unchanged", () => {
    expect(blendWith(PALETTE, "not-a-colour", "multiply")).toEqual(PALETTE);
  });

  it("[] → []", () => {
    expect(blendWith([], "#000000", "multiply")).toEqual([]);
  });
});
