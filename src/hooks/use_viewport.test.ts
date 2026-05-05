import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useViewport } from "./use_viewport";

interface MockMql {
  matches: boolean;
  listeners: Set<() => void>;
}

const makeMatchMedia = (mobile: boolean, landscape: boolean) => {
  const mqls: Record<string, MockMql> = {};
  return Object.assign(
    (query: string) => {
      if (!mqls[query]) {
        const initial = query.includes("max-width") ? mobile : landscape;
        mqls[query] = { matches: initial, listeners: new Set() };
      }
      return wrap(query, mqls);
    },
    { __mqls: mqls },
  );
};

const wrap = (query: string, mqls: Record<string, MockMql>) => ({
  get matches() {
    return mqls[query].matches;
  },
  addEventListener: (_: string, cb: () => void) => mqls[query].listeners.add(cb),
  removeEventListener: (_: string, cb: () => void) =>
    mqls[query].listeners.delete(cb),
});

describe("useViewport", () => {
  let mm: ReturnType<typeof makeMatchMedia>;

  beforeEach(() => {
    mm = makeMatchMedia(false, true);
    vi.stubGlobal("matchMedia", mm);
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: mm,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports desktop when max-width query does not match", () => {
    const { result } = renderHook(() => useViewport());
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isLandscape).toBe(true);
  });

  it("flips isMobile when the matchMedia listener fires", () => {
    const { result } = renderHook(() => useViewport());
    expect(result.current.isMobile).toBe(false);

    act(() => {
      const mql = mm.__mqls["(max-width: 768px)"];
      mql.matches = true;
      mql.listeners.forEach((cb) => cb());
    });

    expect(result.current.isMobile).toBe(true);
  });

  it("flips isLandscape on orientation change", () => {
    const { result } = renderHook(() => useViewport());
    expect(result.current.isLandscape).toBe(true);

    act(() => {
      const mql = mm.__mqls["(orientation: landscape)"];
      mql.matches = false;
      mql.listeners.forEach((cb) => cb());
    });

    expect(result.current.isLandscape).toBe(false);
  });
});
