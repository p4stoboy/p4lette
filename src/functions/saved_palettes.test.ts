import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  SAVED_KEY,
  SAVED_LIMIT,
  SavedPalette,
  loadSaved,
  newSavedId,
  persistSaved,
} from "./saved_palettes";

const sample = (id: string): SavedPalette => ({
  id,
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

  it("persistSaved + loadSaved round-trips entries", () => {
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
});
