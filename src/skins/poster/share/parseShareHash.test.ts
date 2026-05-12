import { describe, expect, it } from "vitest";
import { isShareHash, parseShareHash } from "./parseShareHash";

describe("isShareHash", () => {
  it("matches the share route (bare or with a query)", () => {
    expect(isShareHash("#/share")).toBe(true);
    expect(isShareHash("#/share?p=ff0000")).toBe(true);
    expect(isShareHash("#/share/anything")).toBe(true);
  });
  it("rejects the editor hash, an empty hash, and unrelated hashes", () => {
    expect(isShareHash("#p=ff0000")).toBe(false);
    expect(isShareHash("")).toBe(false);
    expect(isShareHash("#/foo")).toBe(false);
    expect(isShareHash("#sharing")).toBe(false);
  });
});

describe("parseShareHash", () => {
  it("decodes the ?p= value", () => {
    expect(parseShareHash("#/share?p=ff3d00-0e5c9c")).toEqual([
      "#ff3d00",
      "#0e5c9c",
    ]);
  });
  it("keeps every colour — never mis-parses the whole hash (the colour-0 trap)", () => {
    expect(parseShareHash("#/share?p=aabbcc-001122-ddeeff")).toEqual([
      "#aabbcc",
      "#001122",
      "#ddeeff",
    ]);
  });
  it("is null for no/garbage palette and for non-share hashes", () => {
    expect(parseShareHash("#/share")).toBeNull();
    expect(parseShareHash("#/share?x=1")).toBeNull();
    expect(parseShareHash("#/share?p=")).toBeNull();
    expect(parseShareHash("#/share?p=notahex")).toBeNull();
    expect(parseShareHash("#p=ff0000")).toBeNull();
    expect(parseShareHash("")).toBeNull();
  });
});
