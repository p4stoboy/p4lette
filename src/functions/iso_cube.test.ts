import { describe, expect, it } from "vitest";
import { isoBlockStack } from "./iso_cube";

describe("isoBlockStack", () => {
  it("returns an empty stack for a non-positive count", () => {
    expect(isoBlockStack(0)).toEqual({ width: 0, height: 0, blocks: [] });
    expect(isoBlockStack(-3)).toEqual({ width: 0, height: 0, blocks: [] });
  });

  it("box is 2u wide and u + count·c tall", () => {
    const s = isoBlockStack(3, { unit: 100, cube: 50 });
    expect(s.width).toBe(200);
    expect(s.height).toBe(100 + 3 * 50);
    expect(s.blocks).toHaveLength(3);
  });

  it("block 0's top rhombus apex sits at the top of the box, block i is one cube lower", () => {
    const s = isoBlockStack(3, { unit: 100, cube: 50 });
    // cx = u = 100; block 0 top rhombus centre y0 = u/2 = 50 → apex (cx, 0)
    expect(s.blocks[0].top).toContain("100,0");
    // block 1: y0 = 50 + 50 = 100 → apex (100, 50)
    expect(s.blocks[1].top).toContain("100,50");
    // last block's right face ends at (cx, u + count·c) = (100, 250)
    expect(s.blocks[2].right).toContain("100,250");
  });

  it("a default-size stack has 5 blocks for a 5-colour palette", () => {
    expect(isoBlockStack(5).blocks).toHaveLength(5);
  });
});
