import { describe, expect, it } from "vitest";
import { parseShareSearch } from "./parseShareSearch";

describe("parseShareSearch", () => {
  it("decodes the ?p= value (with or without the leading ?)", () => {
    expect(parseShareSearch("?p=ff3d00-0e5c9c")).toEqual([
      "#ff3d00",
      "#0e5c9c",
    ]);
    expect(parseShareSearch("p=ff3d00-0e5c9c")).toEqual(["#ff3d00", "#0e5c9c"]);
  });

  it("keeps every colour — never mis-parses the whole input (the colour-0 trap)", () => {
    expect(parseShareSearch("?p=aabbcc-001122-ddeeff")).toEqual([
      "#aabbcc",
      "#001122",
      "#ddeeff",
    ]);
  });

  it("is null for no/garbage palette and for unrelated searches", () => {
    expect(parseShareSearch("")).toBeNull();
    expect(parseShareSearch("?x=1")).toBeNull();
    expect(parseShareSearch("?p=")).toBeNull();
    expect(parseShareSearch("?p=notahex")).toBeNull();
  });
});
