import { describe, expect, it } from "vitest";
import { ColorCardProps } from "../types/ColorCardProps";
import { resolveTemplate } from "./resolve_export_template";

const make = (hex: string, id: number): ColorCardProps => ({
  id,
  hex,
  locked: false,
  dataId: `${id}`,
});

const palette = [make("#aabbcc", 0), make("#112233", 1)];
const names = ["SKY", "MIDNIGHT"];

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
});
