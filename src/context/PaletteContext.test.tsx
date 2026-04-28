import {act, cleanup, render, screen} from "@testing-library/react";
import {useEffect} from "react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {PaletteContextProps} from "../types/PaletteContextProps";
import {get_color_card_props} from "../functions/get_color_card_props";
import {Provider, usePalette} from "./PaletteContext";
import {PaletteState, createPaletteState} from "./paletteReducer";

let latestContext: PaletteContextProps | undefined;

const first = get_color_card_props("#AABBCC", 0, "first");
const second = get_color_card_props("#112233", 1, "second");

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
            <div data-testid="resolved-template">{context.resolved_template}</div>
        </>
    );
};

const renderProvider = (initialState: PaletteState = createPaletteState("$[all].hex$")) => {
    latestContext = undefined;
    return render(
        <Provider initialState={initialState}>
            <Harness />
        </Provider>
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

    it("adds the requested amount of colors", () => {
        renderProvider();

        act(() => {
            getLatestContext().addColors(2);
        });

        expect(screen.getByTestId("palette-count").textContent).toBe("2");
    });

    it("recomputes resolved exports after deleting a color", () => {
        renderProvider({
            ...createPaletteState("$[all].hex$"),
            palette: [first, second],
            names: ["SKY", "MIDNIGHT"],
        });

        expect(screen.getByTestId("resolved-template").textContent).toBe('[\n"#AABBCC",\n"#112233"\n]');

        act(() => {
            getLatestContext().deleteColor(0);
        });

        expect(screen.getByTestId("resolved-template").textContent).toBe('[\n"#112233"\n]');
    });

    it("recomputes resolved exports after updating a color", () => {
        renderProvider({
            ...createPaletteState("$1.name$:$1.hex$"),
            palette: [first],
            names: ["SKY"],
        });

        act(() => {
            getLatestContext().updateColor(0, "#000000", "first");
        });

        expect(screen.getByTestId("resolved-template").textContent).toBe('"Loading...":"#000000"');
    });

    it("recomputes resolved exports after reorder-style palette and name updates", () => {
        renderProvider({
            ...createPaletteState("$[all].name$"),
            palette: [first, second],
            names: ["SKY", "MIDNIGHT"],
        });
        expect(screen.getByTestId("resolved-template").textContent).toBe('[\n"SKY",\n"MIDNIGHT"\n]');

        act(() => {
            getLatestContext().reorderColor(0, 1);
        });

        expect(screen.getByTestId("resolved-template").textContent).toBe('[\n"MIDNIGHT",\n"SKY"\n]');
    });
});
