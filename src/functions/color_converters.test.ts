import { describe, expect, it } from "vitest";
import {
  formatAll,
  formatColor,
  hexToHsl,
  hexToHsv,
  hexToOkhsl,
  hexToOklch,
  hexToRgb,
  hslToHex,
  hsvToHex,
  okhslToHex,
  oklchToHex,
  parseColor,
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

  it("converts hex to hsv with expected channels", () => {
    const red = hexToHsv("#FF0000");
    expect(Math.round(red.h)).toBe(0);
    expect(Math.round(red.s)).toBe(100);
    expect(Math.round(red.v)).toBe(100);

    const green = hexToHsv("#00FF00");
    expect(Math.round(green.h)).toBe(120);
    expect(Math.round(green.s)).toBe(100);
    expect(Math.round(green.v)).toBe(100);

    const white = hexToHsv("#FFFFFF");
    expect(white.s).toBe(0);
    expect(Math.round(white.v)).toBe(100);

    const black = hexToHsv("#000000");
    expect(black.v).toBe(0);
  });

  it("hexToHsv round-trips through hsvToHex", () => {
    const cases = ["#aabbcc", "#112233", "#445566", "#ff3d00"];
    for (const hex of cases) {
      const back = hsvToHex(hexToHsv(hex)).toLowerCase();
      expect(back).toBe(hex);
    }
  });

  it("converts hex to oklch with expected channels", () => {
    const red = hexToOklch("#FF0000");
    expect(red.l).toBeGreaterThan(60);
    expect(red.l).toBeLessThan(65);
    expect(red.c).toBeGreaterThan(0.24);
    expect(red.c).toBeLessThan(0.27);
    expect(red.h).toBeGreaterThan(25);
    expect(red.h).toBeLessThan(35);

    const white = hexToOklch("#FFFFFF");
    expect(Math.round(white.l)).toBe(100);
    expect(white.c).toBeLessThan(0.01);

    const black = hexToOklch("#000000");
    expect(black.l).toBe(0);
    expect(black.c).toBeLessThan(0.01);
  });

  it("hexToOklch round-trips through oklchToHex within tolerance", () => {
    const cases = ["#aabbcc", "#112233", "#445566", "#ff3d00", "#22c55e"];
    for (const hex of cases) {
      const back = oklchToHex(hexToOklch(hex)).toLowerCase();
      const a = hexToRgb(hex);
      const b = hexToRgb(back);
      expect(Math.abs(a.r - b.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(a.g - b.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(a.b - b.b)).toBeLessThanOrEqual(1);
    }
  });

  it("hexToOkhsl round-trips through okhslToHex within tolerance", () => {
    const cases = [
      "#aabbcc",
      "#112233",
      "#445566",
      "#ff3d00",
      "#22c55e",
      "#aa6f3c",
    ];
    for (const hex of cases) {
      const back = okhslToHex(hexToOkhsl(hex)).toLowerCase();
      const a = hexToRgb(hex);
      const b = hexToRgb(back);
      expect(Math.abs(a.r - b.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(a.g - b.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(a.b - b.b)).toBeLessThanOrEqual(1);
    }
  });

  it("hexToOkhsl: channels normalised; achromatic colours don't NaN the hue", () => {
    const red = hexToOkhsl("#ff0000");
    expect(red.h).toBeGreaterThanOrEqual(0);
    expect(red.h).toBeLessThan(360);
    expect(red.s).toBeGreaterThan(0.9);
    expect(red.s).toBeLessThanOrEqual(1);
    expect(red.l).toBeGreaterThan(0);
    expect(red.l).toBeLessThan(1);
    for (const grey of ["#808080", "#000000", "#ffffff"]) {
      const o = hexToOkhsl(grey);
      expect(o.s).toBeCloseTo(0, 5);
      expect(Number.isFinite(o.h)).toBe(true);
    }
  });

  it("okhslToHex clamps out-of-range s/l", () => {
    expect(okhslToHex({ h: 30, s: 2, l: -1 })).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("formatColor renders each mode as a display string", () => {
    expect(formatColor("#ff0000", "hex")).toBe("#FF0000");
    expect(formatColor("#ff0000", "rgb")).toBe("rgb(255, 0, 0)");
    expect(formatColor("#ff0000", "hsl")).toBe("hsl(0, 100%, 50%)");
    expect(formatColor("#ff0000", "hsv")).toBe("hsv(0, 100%, 100%)");
    expect(formatColor("#ff0000", "oklch")).toMatch(
      /^oklch\(\d+(\.\d+)?%, 0\.\d+, \d+(\.\d+)?\)$/,
    );
  });

  it("formatAll returns all five formats, HEX first, each matching formatColor", () => {
    const all = formatAll("#ff3d00");
    expect(all.map((f) => f.mode)).toEqual([
      "hex",
      "rgb",
      "hsl",
      "hsv",
      "oklch",
    ]);
    expect(all[0].label).toBe("HEX");
    for (const { mode, value } of all) {
      expect(value).toBe(formatColor("#ff3d00", mode));
    }
  });

  it("parseColor accepts the mode-specific string and returns hex", () => {
    expect(parseColor("#ff0000", "hex")).toBe("#ff0000");
    expect(parseColor("ff0000", "hex")).toBe("#ff0000");
    expect(parseColor("rgb(255, 0, 0)", "rgb")).toBe("#ff0000");
    expect(parseColor("255 0 0", "rgb")).toBe("#ff0000");
    expect(parseColor("hsl(0, 100%, 50%)", "hsl")).toBe("#ff0000");
    expect(parseColor("0, 100, 50", "hsl")).toBe("#ff0000");
    expect(parseColor("hsv(0, 100%, 100%)", "hsv")).toBe("#ff0000");
  });

  it("parseColor returns null on invalid input", () => {
    expect(parseColor("not-a-color", "hex")).toBeNull();
    expect(parseColor("rgb(999, 0, 0)", "rgb")).toBe("#ff0000");
    expect(parseColor("", "hex")).toBeNull();
  });
});
