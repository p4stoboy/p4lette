import { describe, expect, it } from "vitest";
import { ColorCardProps } from "../types/ColorCardProps";
import { decodePalette, encodePalette } from "./share_url";

const make = (hex: string, id: number): ColorCardProps => ({
  id,
  hex,
  locked: false,
  dataId: `${id}`,
});

describe("encodePalette / decodePalette", () => {
  it("round-trips a palette", () => {
    const palette = [
      make("#ff0000", 0),
      make("#00ff00", 1),
      make("#0000ff", 2),
    ];
    const encoded = encodePalette(palette);
    expect(encoded).toBe("ff0000-00ff00-0000ff");
    expect(decodePalette(`#p=${encoded}`)).toEqual([
      "#ff0000",
      "#00ff00",
      "#0000ff",
    ]);
  });

  it("decodes raw payloads without the #p= prefix", () => {
    expect(decodePalette("ff0000-00ff00")).toEqual(["#ff0000", "#00ff00"]);
  });

  it("returns null for empty or null input", () => {
    expect(decodePalette(null)).toBeNull();
    expect(decodePalette(undefined)).toBeNull();
    expect(decodePalette("")).toBeNull();
    expect(decodePalette("#p=")).toBeNull();
  });

  it("filters invalid hexes and returns null when none survive", () => {
    expect(decodePalette("#p=zzzzzz-aabbcc")).toEqual(["#aabbcc"]);
    expect(decodePalette("#p=zzzzzz-not-hex")).toBeNull();
  });
});
