import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  SAVED_KEY,
  SAVED_LIMIT,
  SavedPalette,
  defaultPaletteName,
  loadSaved,
  newSavedId,
  persistSaved,
} from "./saved_palettes";

const sample = (id: string): SavedPalette => ({
  id,
  name: `palette ${id}`,
  hexes: ["#ff0000", "#00ff00"],
  createdAt: 1700000000000,
});

describe("saved_palettes", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("loadSaved returns [] when storage is empty", () => {
    expect(loadSaved()).toEqual([]);
  });

  it("persistSaved + loadSaved round-trips entries (name included)", () => {
    const list = [sample("a"), sample("b")];
    persistSaved(list);
    expect(loadSaved()).toEqual(list);
  });

  it("loadSaved returns [] for invalid JSON", () => {
    localStorage.setItem(SAVED_KEY, "not-json");
    expect(loadSaved()).toEqual([]);
  });

  it("loadSaved filters out malformed entries", () => {
    const valid = sample("ok");
    localStorage.setItem(
      SAVED_KEY,
      JSON.stringify([valid, { id: 1 }, null, { id: "x", hexes: "no" }]),
    );
    expect(loadSaved()).toEqual([valid]);
  });

  it("loadSaved backfills a name for legacy entries that lack one", () => {
    const legacy = { id: "old", hexes: ["#abc123"], createdAt: 1700000000000 };
    localStorage.setItem(SAVED_KEY, JSON.stringify([legacy]));
    const [loaded] = loadSaved();
    expect(loaded.id).toBe("old");
    expect(loaded.hexes).toEqual(["#abc123"]);
    expect(typeof loaded.name).toBe("string");
    expect(loaded.name.length).toBeGreaterThan(0);
  });

  it("loadSaved replaces a blank/whitespace name with a default", () => {
    const blank = {
      id: "b",
      name: "   ",
      hexes: ["#000000"],
      createdAt: 1700000000000,
    };
    localStorage.setItem(SAVED_KEY, JSON.stringify([blank]));
    expect(loadSaved()[0].name.trim().length).toBeGreaterThan(0);
  });

  it("persistSaved trims to SAVED_LIMIT entries", () => {
    const list = Array.from({ length: SAVED_LIMIT + 5 }, (_, i) =>
      sample(String(i)),
    );
    persistSaved(list);
    expect(loadSaved()).toHaveLength(SAVED_LIMIT);
  });

  it("newSavedId returns a unique non-empty string", () => {
    const a = newSavedId();
    const b = newSavedId();
    expect(typeof a).toBe("string");
    expect(a.length).toBeGreaterThan(0);
    expect(a).not.toBe(b);
  });

  it("defaultPaletteName produces a palette-YYYY-MM-DD-HHmm stamp", () => {
    expect(defaultPaletteName(1700000000000)).toMatch(
      /^palette-\d{4}-\d{2}-\d{2}-\d{4}$/,
    );
  });
});
