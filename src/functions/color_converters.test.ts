import { describe, expect, it } from "vitest";
import {
  hexToHsl,
  hexToRgb,
  hslToHex,
  randomHex,
  rgbToHex,
} from "./color_converters";

describe("color_converters", () => {
  it("converts hex to rgb", () => {
    expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("converts hex to hsl with expected hue/sat/lum", () => {
    const white = hexToHsl("#FFFFFF");
    expect(white.s).toBe(0);
    expect(Math.round(white.l)).toBe(100);

    const black = hexToHsl("#000000");
    expect(black.l).toBe(0);

    const red = hexToHsl("#FF0000");
    expect(Math.round(red.h)).toBe(0);
    expect(Math.round(red.s)).toBe(100);
    expect(Math.round(red.l)).toBe(50);
  });

  it("rgbToHex pads single-digit channels", () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
    expect(rgbToHex({ r: 255, g: 0, b: 16 })).toBe("#ff0010");
  });

  it("hexToHsl round-trips through hslToHex", () => {
    const cases = ["#aabbcc", "#112233", "#445566", "#ff3d00"];
    for (const hex of cases) {
      const back = hslToHex(hexToHsl(hex)).toLowerCase();
      expect(back).toBe(hex);
    }
  });

  it("randomHex returns a valid 6-digit hex string", () => {
    for (let i = 0; i < 50; i++) {
      const v = randomHex();
      expect(v).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
