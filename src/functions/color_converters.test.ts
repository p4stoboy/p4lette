import {describe, expect, it} from "vitest";
import {HexToHSL, resolve_color} from "./color_converters";

describe("color converters", () => {
    it("converts hex colors to HSL", () => {
        expect(HexToHSL("#FFFFFF")).toEqual({h: 0, s: 0, l: 100});
        expect(HexToHSL("#000000")).toEqual({h: 0, s: 0, l: 0});
        expect(HexToHSL("#FF0000")).toEqual({h: 0, s: 100, l: 50});
        expect(HexToHSL("#fff")).toEqual({h: 0, s: 0, l: 100});
    });

    it("resolves hex, rgb, and hsl values together", () => {
        expect(resolve_color("00FF00")).toEqual({
            hex: "#00FF00",
            rgb: {r: 0, g: 255, b: 0},
            hsl: {h: 120, s: 100, l: 50},
        });
    });

    it("throws for invalid hex colors", () => {
        expect(() => HexToHSL("bad")).toThrow("Could not parse Hex Color");
    });
});
