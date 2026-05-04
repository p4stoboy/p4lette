import { describe, expect, it } from "vitest";
import { contrast, fontColorFor, luminance } from "./contrast";

describe("luminance", () => {
  it("returns 0 for black and ~1 for white", () => {
    expect(luminance("#000000")).toBe(0);
    expect(luminance("#FFFFFF")).toBeCloseTo(1, 5);
  });
});

describe("contrast", () => {
  it("computes ~21:1 for black/white", () => {
    expect(contrast("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  });

  it("is symmetric in arguments", () => {
    expect(contrast("#aabbcc", "#112233")).toBeCloseTo(
      contrast("#112233", "#aabbcc"),
      5,
    );
  });

  it("returns 1 for identical colors", () => {
    expect(contrast("#abcdef", "#abcdef")).toBeCloseTo(1, 5);
  });
});

describe("fontColorFor", () => {
  it("picks white text on a dark background", () => {
    expect(fontColorFor("#000000")).toBe("#ffffff");
    expect(fontColorFor("#1a1a1a")).toBe("#ffffff");
  });

  it("picks black text on a light background", () => {
    expect(fontColorFor("#ffffff")).toBe("#000000");
    expect(fontColorFor("#fff8e7")).toBe("#000000");
  });
});
