import { describe, expect, it } from "vitest";
import { CvdType, simulateCvd, snapToGamut } from "./color_filters";

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
