import { act, cleanup, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ColorCardProps } from "../types/ColorCardProps";
import { PaletteContextProps } from "../types/PaletteContextProps";
import { Provider, usePalette } from "./PaletteContext";
import { PaletteState, createPaletteState } from "./paletteReducer";

let latestContext: PaletteContextProps | undefined;

const make = (hex: string, id: number): ColorCardProps => ({
  id,
  hex,
  locked: false,
  dataId: `dataId-${id}`,
});

const first = make("#aabbcc", 0);
const second = make("#112233", 1);

const getLatestContext = (): PaletteContextProps => {
  if (!latestContext) throw new Error("Palette context was not rendered");
  return latestContext;
};

const Harness = () => {
  const context = usePalette();
  useEffect(() => {
    latestContext = context;
  }, [context]);
  return (
    <>
      <div data-testid="palette-count">{context.palette.length}</div>
      <div data-testid="resolved-template">{context.resolvedTemplate}</div>
    </>
  );
};

const renderProvider = (
  initialState: PaletteState = createPaletteState({
    exportTemplate: "$[all].hex$",
    initialCount: 0,
  }),
) => {
  latestContext = undefined;
  return render(
    <Provider initialState={initialState}>
      <Harness />
    </Provider>,
  );
};

describe("PaletteContext", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    latestContext = undefined;
  });

  it("addColor appends one color", () => {
    renderProvider();
    act(() => {
      getLatestContext().addColor("#abcdef");
    });
    expect(screen.getByTestId("palette-count").textContent).toBe("1");
  });

  it("recomputes resolvedTemplate after deleting a color", () => {
    renderProvider({
      ...createPaletteState({ exportTemplate: "$[all].hex$", initialCount: 0 }),
      palette: [first, second],
      names: ["SKY", "MIDNIGHT"],
    });

    expect(screen.getByTestId("resolved-template").textContent).toBe(
      '["#aabbcc","#112233"]',
    );

    act(() => {
      getLatestContext().deleteColor(0);
    });

    expect(screen.getByTestId("resolved-template").textContent).toBe(
      '["#112233"]',
    );
  });

  it("recomputes resolvedTemplate after updating a color", () => {
    renderProvider({
      ...createPaletteState({ exportTemplate: "$1.hex$", initialCount: 0 }),
      palette: [first],
      names: ["SKY"],
    });

    act(() => {
      getLatestContext().updateColor(0, "#000000");
    });

    expect(screen.getByTestId("resolved-template").textContent).toBe("#000000");
  });

  it("recomputes resolvedTemplate after reorder", () => {
    renderProvider({
      ...createPaletteState({
        exportTemplate: "$[all].name$",
        initialCount: 0,
      }),
      palette: [first, second],
      names: ["SKY", "MIDNIGHT"],
    });
    expect(screen.getByTestId("resolved-template").textContent).toBe(
      '["SKY","MIDNIGHT"]',
    );

    act(() => {
      getLatestContext().reorderColor(0, 1);
    });

    expect(screen.getByTestId("resolved-template").textContent).toBe(
      '["MIDNIGHT","SKY"]',
    );
  });

  it("toggleLock flips the locked flag", () => {
    renderProvider({
      ...createPaletteState({ exportTemplate: "$1$", initialCount: 0 }),
      palette: [first],
      names: ["SKY"],
    });
    act(() => {
      getLatestContext().toggleLock(0);
    });
    expect(getLatestContext().palette[0].locked).toBe(true);
  });

  it("replaceAll resets the palette to the provided hexes", () => {
    renderProvider({
      ...createPaletteState({ exportTemplate: "$[all].hex$", initialCount: 0 }),
      palette: [first, second],
      names: ["SKY", "MIDNIGHT"],
    });

    act(() => {
      getLatestContext().replaceAll(["#000000", "#ffffff"]);
    });
    expect(screen.getByTestId("resolved-template").textContent).toBe(
      '["#000000","#ffffff"]',
    );
  });
});
