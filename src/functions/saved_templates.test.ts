import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  SAVED_TEMPLATES_KEY,
  SAVED_TEMPLATES_LIMIT,
  SavedTemplate,
  loadSavedTemplates,
  newSavedTemplateId,
  persistSavedTemplates,
} from "./saved_templates";

const ENTRY = (name: string, body = "tpl body"): SavedTemplate => ({
  id: name,
  name,
  body,
  createdAt: Date.now(),
});

describe("saved_templates", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });

  it("loadSavedTemplates returns [] when key is missing", () => {
    expect(loadSavedTemplates()).toEqual([]);
  });

  it("persist then load roundtrips", () => {
    const list = [ENTRY("one"), ENTRY("two")];
    persistSavedTemplates(list);
    expect(loadSavedTemplates()).toEqual(list);
  });

  it("persist trims to SAVED_TEMPLATES_LIMIT", () => {
    const big = Array.from({ length: SAVED_TEMPLATES_LIMIT + 5 }, (_, i) =>
      ENTRY(`t${i}`),
    );
    persistSavedTemplates(big);
    const loaded = loadSavedTemplates();
    expect(loaded).toHaveLength(SAVED_TEMPLATES_LIMIT);
    expect(loaded[0].id).toBe("t0");
  });

  it("loadSavedTemplates ignores invalid entries", () => {
    localStorage.setItem(
      SAVED_TEMPLATES_KEY,
      JSON.stringify([
        { id: "good", name: "good", body: "x", createdAt: 1 },
        { id: 42, name: "bad-id" },
        null,
        "string-instead-of-object",
      ]),
    );
    const loaded = loadSavedTemplates();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe("good");
  });

  it("loadSavedTemplates returns [] for unparseable storage", () => {
    localStorage.setItem(SAVED_TEMPLATES_KEY, "not json");
    expect(loadSavedTemplates()).toEqual([]);
  });

  it("newSavedTemplateId returns unique ids", () => {
    const a = newSavedTemplateId();
    const b = newSavedTemplateId();
    expect(a).not.toBe(b);
    expect(typeof a).toBe("string");
  });
});
