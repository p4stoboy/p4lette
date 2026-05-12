import { describe, expect, it } from "vitest";
import { MIX_CURVES, MIX_SPACES, MIX_STEPS, mixSteps } from "./color_mix";

const A = "#ff3d00";
const B = "#00b4d8";
const isHex = (h: string): boolean => /^#[0-9a-f]{6}$/.test(h);
const near = (x: string, y: string): boolean => {
  const ch = (h: string): number[] => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  return ch(x).every((c, i) => Math.abs(c - ch(y)[i]) <= 4);
};

describe("MIX constants", () => {
  it("MIX_SPACES / MIX_STEPS / MIX_CURVES are non-empty and well-formed", () => {
    expect(MIX_SPACES.map((s) => s.key)).toContain("oklch");
    expect(MIX_STEPS.length).toBeGreaterThan(1);
    expect(MIX_CURVES.map((c) => c.key)).toContain("even");
    for (const s of MIX_SPACES) expect(s.label).toMatch(/\S/);
    for (const c of MIX_CURVES) expect(c.label).toMatch(/\S/);
  });
});

describe("mixSteps", () => {
  it.each(MIX_STEPS)("n=%i → n valid hexes; endpoints are FROM / TO", (n) => {
    const out = mixSteps(A, B, n, "oklch", "even");
    expect(out).toHaveLength(n);
    for (const h of out) expect(isHex(h)).toBe(true);
    expect(near(out[0], A)).toBe(true);
    expect(near(out[out.length - 1], B)).toBe(true);
  });

  it.each(MIX_SPACES.map((s) => s.key))(
    "space %s — no throw, valid hexes",
    (space) => {
      const out = mixSteps(A, B, 5, space, "even");
      expect(out).toHaveLength(5);
      for (const h of out) expect(isHex(h)).toBe(true);
    },
  );

  it("a == b → every step is ~a", () => {
    for (const h of mixSteps(A, A, 5, "oklch", "even")) {
      expect(near(h, A)).toBe(true);
    }
  });

  it("a non-EVEN curve biases the sample distribution", () => {
    expect(mixSteps(A, B, 7, "oklch", "ease-from")).not.toEqual(
      mixSteps(A, B, 7, "oklch", "even"),
    );
    expect(mixSteps(A, B, 7, "oklch", "ease-to")).not.toEqual(
      mixSteps(A, B, 7, "oklch", "even"),
    );
  });

  it("HSL takes the hue-wheel route — a mid step differs from the OKLCH one", () => {
    expect(mixSteps(A, B, 3, "hsl", "even")[1]).not.toBe(
      mixSteps(A, B, 3, "oklch", "even")[1],
    );
  });

  it("bad input falls back gracefully", () => {
    expect(mixSteps("garbage", B, 4, "oklch", "even")).toEqual([B, B, B, B]);
    for (const h of mixSteps("garbage", "also-bad", 3, "oklch", "even")) {
      expect(isHex(h)).toBe(true);
    }
  });
});
