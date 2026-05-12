import { describe, expect, it } from "vitest";
import { ColorCardProps } from "../types/ColorCardProps";
import { EXPORT_PRESETS, resolveTemplate } from "./resolve_export_template";

const make = (hex: string, id: number): ColorCardProps => ({
  id,
  hex,
  locked: false,
  dataId: `${id}`,
});

const palette = [make("#aabbcc", 0), make("#112233", 1)];
const names = ["SKY", "MIDNIGHT"];

const palette5 = [
  make("#ff3d00", 0),
  make("#00b4d8", 1),
  make("#06d6a0", 2),
  make("#ffd166", 3),
  make("#7209b7", 4),
];
const names5 = ["EMBER", "OCEAN", "MINT", "HONEY", "PLUM"];

describe("resolveTemplate", () => {
  it("resolves a single color property as a bare value", () => {
    expect(resolveTemplate("main: $1.hex$", palette, names)).toBe(
      "main: #aabbcc",
    );
    expect(resolveTemplate("$2.name$", palette, names)).toBe("MIDNIGHT");
  });

  it("resolves a full color object as JSON", () => {
    const result = resolveTemplate("$1$", palette, names);
    expect(result).toContain('"name":"SKY"');
    expect(result).toContain('"hex":"#aabbcc"');
    expect(result).toContain('"rgb"');
    expect(result).toContain('"hsl"');
  });

  it("resolves array selectors", () => {
    expect(resolveTemplate("$[1,2].name$", palette, names)).toBe(
      '["SKY","MIDNIGHT"]',
    );
  });

  it("resolves the [all] selector", () => {
    expect(resolveTemplate("$[all].hex$", palette, names)).toBe(
      '["#aabbcc","#112233"]',
    );
  });

  it("resolves repeated tokens deterministically", () => {
    expect(resolveTemplate("$1.hex$/$1.hex$", palette, names)).toBe(
      "#aabbcc/#aabbcc",
    );
  });

  it("returns explicit error markers for unknown ids and props", () => {
    expect(resolveTemplate("$3.hex$", palette, names)).toBe(
      "[ERROR: no color 3]",
    );
    expect(resolveTemplate("$1.cmyk$", palette, names)).toBe(
      "[ERROR: no prop cmyk]",
    );
  });

  it("filters missing ids out of array results", () => {
    expect(resolveTemplate("$[1,9].hex$", palette, names)).toBe('["#aabbcc"]');
  });

  it("resolves hsv and oklch token properties", () => {
    const result = resolveTemplate("$1$", palette, names);
    expect(result).toContain('"hsv"');
    expect(result).toContain('"oklch"');
    expect(resolveTemplate("$[all].hsv$", palette, names)).toContain('{"h":');
    expect(resolveTemplate("$[all].oklch$", palette, names)).toContain('{"l":');
  });

  it("exposes CSS-ready value strings (rgbCss / hslCss / oklchCss)", () => {
    expect(resolveTemplate("$1.rgbCss$", palette, names)).toMatch(
      /^\d+, \d+, \d+$/,
    );
    expect(resolveTemplate("$1.hslCss$", palette, names)).toMatch(
      /^\d+, \d+%, \d+%$/,
    );
    expect(resolveTemplate("$1.oklchCss$", palette, names)).toMatch(
      /^[\d.]+ [\d.]+ [\d.]+$/,
    );
  });
});

describe("EXPORT_PRESETS", () => {
  it("every preset resolves against a 5-colour palette without error markers", () => {
    for (const p of EXPORT_PRESETS) {
      const out = resolveTemplate(p.body, palette5, names5);
      expect(out, `${p.key} produced: ${out}`).not.toMatch(/\[ERROR/);
    }
  });

  it("keys are unique; keys/labels/bodies are non-empty (and bodies use a token)", () => {
    const keys = EXPORT_PRESETS.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const p of EXPORT_PRESETS) {
      expect(p.key).toMatch(/\S/);
      expect(p.label).toMatch(/\S/);
      expect(p.body).toMatch(/\$/);
    }
  });
});
