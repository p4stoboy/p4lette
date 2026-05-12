import { describe, expect, it } from "vitest";
import { paletteStats } from "./palette_stats";

describe("paletteStats", () => {
  it("returns neutral values for an empty palette", () => {
    const s = paletteStats([]);
    expect(s.avgLightness).toBe(0);
    expect(s.hueSpreadDeg).toBe(0);
    expect(s.warmCount).toBe(0);
    expect(s.coolCount).toBe(0);
    expect(s.mostSaturated).toBe("");
    expect(s.leastSaturated).toBe("");
    expect(s.worstContrast.ratio).toBe(1);
  });

  it("handles a single colour — no pair, hue spread 0", () => {
    const s = paletteStats(["#ff3d00"]);
    expect(s.hueSpreadDeg).toBe(0);
    expect(s.warmCount + s.coolCount).toBe(1);
    expect(s.mostSaturated).toBe("#ff3d00");
    expect(s.leastSaturated).toBe("#ff3d00");
    expect(s.worstContrast.ratio).toBe(1);
  });

  it("reports hue spread 0 for a monochrome palette", () => {
    const s = paletteStats(["#3366cc", "#3366cc", "#3366cc"]);
    expect(s.hueSpreadDeg).toBe(0);
  });

  it("reports hue spread 0 for an all-grayscale palette", () => {
    const s = paletteStats(["#000000", "#808080", "#ffffff"]);
    expect(s.hueSpreadDeg).toBe(0);
    expect(s.avgLightness).toBeGreaterThan(0);
    expect(s.avgLightness).toBeLessThanOrEqual(100);
  });

  it("computes a non-trivial hue spread", () => {
    // pure red, green, blue — three roughly evenly spaced hues
    const s = paletteStats(["#ff0000", "#00ff00", "#0000ff"]);
    expect(s.hueSpreadDeg).toBeGreaterThan(180);
  });

  it("counts warm vs cool and finds the worst-contrast pair", () => {
    const s = paletteStats(["#ff0000", "#00ff00", "#ffffff"]);
    expect(s.warmCount + s.coolCount).toBe(3);
    expect(s.coolCount).toBeGreaterThanOrEqual(1); // the green
    // white-on-green is the lowest-contrast pair here (≈ 1.4:1)
    expect(s.worstContrast.ratio).toBeLessThan(2);
    expect([s.worstContrast.a, s.worstContrast.b].sort()).toEqual(
      ["#00ff00", "#ffffff"].sort(),
    );
  });

  it("identifies the most and least saturated swatches", () => {
    const s = paletteStats(["#ff007f", "#888785", "#7f3fff"]);
    expect(s.leastSaturated).toBe("#888785");
    expect(["#ff007f", "#7f3fff"]).toContain(s.mostSaturated);
  });
});
