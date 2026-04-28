import {describe, expect, it} from "vitest";
import {get_color_card_props} from "../functions/get_color_card_props";
import {PaletteState, createPaletteState, paletteReducer} from "./paletteReducer";

const first = get_color_card_props("#AABBCC", 0, "first");
const second = get_color_card_props("#112233", 1, "second");
const third = get_color_card_props("#445566", 2, "third");

const state = (overrides: Partial<PaletteState> = {}): PaletteState => ({
    ...createPaletteState("$[all].hex$"),
    palette: [first, second],
    names: ["SKY", "MIDNIGHT"],
    ...overrides,
});

describe("paletteReducer", () => {
    it("adds colors and renumbers ids", () => {
        const result = paletteReducer(state(), {
            type: "addColors",
            colors: [{...third, id: 99}],
        });

        expect(result.palette.map((color) => color.id)).toEqual([0, 1, 2]);
        expect(result.palette[2].data_id).toBe("third");
        expect(result.names).toEqual(["SKY", "MIDNIGHT", "Loading..."]);
    });

    it("deletes colors and keeps names aligned", () => {
        const result = paletteReducer(state(), {type: "deleteColor", id: 0});

        expect(result.palette).toEqual([{...second, id: 0}]);
        expect(result.names).toEqual(["MIDNIGHT"]);
    });

    it("updates colors and resets only the changed name", () => {
        const result = paletteReducer(state(), {
            type: "updateColor",
            id: 1,
            color: {...third, id: 1},
        });

        expect(result.palette).toEqual([first, {...third, id: 1}]);
        expect(result.names).toEqual(["SKY", "Loading..."]);
    });

    it("reorders colors and names together", () => {
        const result = paletteReducer(state(), {type: "reorderColor", fromIndex: 0, toIndex: 1});

        expect(result.palette).toEqual([{...second, id: 0}, {...first, id: 1}]);
        expect(result.names).toEqual(["MIDNIGHT", "SKY"]);
    });

    it("aligns fetched names to the current palette length", () => {
        const result = paletteReducer(state({palette: [first, second, third]}), {
            type: "setNames",
            names: ["SKY"],
        });

        expect(result.names).toEqual(["SKY", "Loading...", "Loading..."]);
    });
});
