import {describe, expect, it} from "vitest";
import {brightnessByColor} from "./brightness";

describe("brightnessByColor", () => {
    it("calculates brightness for six-digit hex colors", () => {
        expect(brightnessByColor("#000000")).toBe(0);
        expect(brightnessByColor("#FFFFFF")).toBe(255);
    });

    it("calculates brightness for short hex colors", () => {
        expect(brightnessByColor("#000")).toBe(0);
        expect(brightnessByColor("#fff")).toBe(255);
    });

    it("calculates brightness for rgb and rgba colors", () => {
        expect(brightnessByColor("rgb(255, 255, 255)")).toBe(255);
        expect(brightnessByColor("rgba(0, 0, 0, 0.5)")).toBe(0);
    });

    it("returns undefined for unsupported color input", () => {
        expect(brightnessByColor("not-a-color")).toBeUndefined();
        expect(brightnessByColor("rgb(999, 0, 0)")).toBeUndefined();
    });
});
