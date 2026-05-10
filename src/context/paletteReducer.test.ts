import { describe, expect, it } from "vitest";
import { ColorCardProps } from "../types/ColorCardProps";
import {
  PaletteState,
  createPaletteState,
  paletteReducer,
} from "./paletteReducer";

const make = (hex: string, id: number, locked = false): ColorCardProps => ({
  id,
  hex,
  locked,
  dataId: `dataId-${id}`,
});

const baseState = (overrides: Partial<PaletteState> = {}): PaletteState => ({
  ...createPaletteState({ exportTemplate: "$[all].hex$", initialCount: 0 }),
  palette: [make("#aabbcc", 0), make("#112233", 1)],
  names: ["SKY", "MIDNIGHT"],
  ...overrides,
});

describe("createPaletteState", () => {
  it("seeds from a hash when provided", () => {
    const state = createPaletteState({
      exportTemplate: "tpl",
      hash: "#p=ff0000-00ff00",
    });
    expect(state.palette.map((c) => c.hex)).toEqual(["#ff0000", "#00ff00"]);
    expect(state.palette.every((c) => !c.locked)).toBe(true);
    expect(state.exportTemplate).toBe("tpl");
  });

  it("falls back to random colors when no hash is provided", () => {
    const state = createPaletteState({
      exportTemplate: "tpl",
      initialCount: 4,
    });
    expect(state.palette).toHaveLength(4);
    for (const c of state.palette) {
      expect(c.hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("paletteReducer", () => {
  it("appends a color via addColor", () => {
    const result = paletteReducer(baseState(), {
      type: "addColor",
      hex: "#445566",
    });
    expect(result.palette.map((c) => c.hex)).toEqual([
      "#aabbcc",
      "#112233",
      "#445566",
    ]);
    expect(result.palette.map((c) => c.id)).toEqual([0, 1, 2]);
    expect(result.names).toEqual(["SKY", "MIDNIGHT", "..."]);
  });

  it("deletes by id and renumbers", () => {
    const result = paletteReducer(baseState(), { type: "deleteColor", id: 0 });
    expect(result.palette).toHaveLength(1);
    expect(result.palette[0].id).toBe(0);
    expect(result.palette[0].hex).toBe("#112233");
    expect(result.names).toEqual(["MIDNIGHT"]);
  });

  it("updates only the matching color and clears its name", () => {
    const result = paletteReducer(baseState(), {
      type: "updateColor",
      id: 1,
      hex: "#000000",
    });
    expect(result.palette[0].hex).toBe("#aabbcc");
    expect(result.palette[1].hex).toBe("#000000");
    expect(result.names).toEqual(["SKY", "..."]);
  });

  it("reorders palette and names together", () => {
    const result = paletteReducer(baseState(), {
      type: "reorderColor",
      fromIndex: 0,
      toIndex: 1,
    });
    expect(result.palette.map((c) => c.hex)).toEqual(["#112233", "#aabbcc"]);
    expect(result.names).toEqual(["MIDNIGHT", "SKY"]);
  });

  it("toggleLock flips the locked flag of the matching id only", () => {
    const start = baseState();
    const after = paletteReducer(start, { type: "toggleLock", id: 0 });
    expect(after.palette[0].locked).toBe(true);
    expect(after.palette[1].locked).toBe(false);
    const back = paletteReducer(after, { type: "toggleLock", id: 0 });
    expect(back.palette[0].locked).toBe(false);
  });

  it("randomizeUnlocked preserves locked colors and re-rolls others", () => {
    const start = baseState({
      palette: [make("#aabbcc", 0, true), make("#112233", 1)],
    });
    const result = paletteReducer(start, { type: "randomizeUnlocked" });
    expect(result.palette[0].hex).toBe("#aabbcc");
    expect(result.palette[1].hex).not.toBe("#112233");
    expect(result.palette[1].hex).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("replaceAll resets palette to provided hexes and clears names", () => {
    const result = paletteReducer(baseState(), {
      type: "replaceAll",
      hexes: ["#000000", "#ffffff", "#888888"],
    });
    expect(result.palette.map((c) => c.hex)).toEqual([
      "#000000",
      "#ffffff",
      "#888888",
    ]);
    expect(result.palette.map((c) => c.id)).toEqual([0, 1, 2]);
    expect(result.names).toEqual(["...", "...", "..."]);
  });

  it("setNames pads to palette length", () => {
    const result = paletteReducer(
      baseState({ palette: [make("#a", 0), make("#b", 1), make("#c", 2)] }),
      {
        type: "setNames",
        names: ["A"],
      },
    );
    expect(result.names).toHaveLength(3);
    expect(result.names[0]).toBe("A");
  });

  it("setNameList clears names so previous-list names cannot leak as fallbacks", () => {
    const state = baseState({ nameList: "bestOf" });
    const result = paletteReducer(state, {
      type: "setNameList",
      list: "wikipedia",
    });
    expect(result.nameList).toBe("wikipedia");
    expect(result.names).toEqual(["...", "..."]);
  });

  it("setNameList is a no-op when the list is unchanged", () => {
    const state = baseState({ nameList: "bestOf" });
    const result = paletteReducer(state, {
      type: "setNameList",
      list: "bestOf",
    });
    expect(result).toBe(state);
  });
});
