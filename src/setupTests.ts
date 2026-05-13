import "@testing-library/jest-dom/vitest";

// jsdom implements neither `matchMedia` nor `ResizeObserver` — stub them so
// components that read the viewport (`useViewport`) or measure themselves
// (`use_fit_name_size`) render under the test environment.
const noop = (): void => undefined;

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: noop,
    removeListener: noop,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe = noop;
    unobserve = noop;
    disconnect = noop;
  }
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}
