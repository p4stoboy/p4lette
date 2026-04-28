import {ColorCardProps} from "../types/ColorCardProps";
import {Palette} from "../types/Palette";

export type PaletteState = {
    palette: Palette;
    names: string[];
    export_visible: boolean;
    export_template: string;
};

export type PaletteAction =
    | {type: "addColors", colors: ColorCardProps[]}
    | {type: "deleteColor", id: number}
    | {type: "updateColor", id: number, color: ColorCardProps}
    | {type: "reorderColor", fromIndex: number, toIndex: number}
    | {type: "setNames", names: string[]}
    | {type: "setExportTemplate", template: string}
    | {type: "setExportVisible", visible: boolean};

export const createPaletteState = (export_template: string): PaletteState => ({
    palette: [],
    names: [],
    export_visible: false,
    export_template,
});

const renumberPalette = (palette: Palette): Palette => palette.map((color, id) => ({...color, id}));

const reorderItems = <T,>(items: T[], fromIndex: number, toIndex: number): T[] => {
    if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= items.length ||
        toIndex >= items.length
    ) {
        return items;
    }

    const next = [...items];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
};

const alignNames = (palette: Palette, names: string[]): string[] =>
    palette.map((_, i) => names[i] ?? "Loading...");

export const paletteReducer = (state: PaletteState, action: PaletteAction): PaletteState => {
    switch (action.type) {
        case "addColors": {
            if (action.colors.length === 0) return state;
            const palette = renumberPalette([...state.palette, ...action.colors]);
            return {
                ...state,
                palette,
                names: [...state.names, ...action.colors.map(() => "Loading...")],
            };
        }
        case "deleteColor": {
            const deleteIndex = state.palette.findIndex((color) => color.id === action.id);
            if (deleteIndex === -1) return state;

            const palette = renumberPalette(state.palette.filter((_, i) => i !== deleteIndex));
            return {
                ...state,
                palette,
                names: state.names.filter((_, i) => i !== deleteIndex),
            };
        }
        case "updateColor": {
            const updateIndex = state.palette.findIndex((color) => color.id === action.id);
            if (updateIndex === -1) return state;

            const palette = renumberPalette(state.palette.map((color, i) =>
                i === updateIndex ? action.color : color
            ));
            return {
                ...state,
                palette,
                names: state.names.map((name, i) => i === updateIndex ? "Loading..." : name),
            };
        }
        case "reorderColor": {
            const palette = renumberPalette(reorderItems(state.palette, action.fromIndex, action.toIndex));
            return {
                ...state,
                palette,
                names: reorderItems(state.names, action.fromIndex, action.toIndex),
            };
        }
        case "setNames":
            return {
                ...state,
                names: alignNames(state.palette, action.names),
            };
        case "setExportTemplate":
            return {
                ...state,
                export_template: action.template,
            };
        case "setExportVisible":
            return {
                ...state,
                export_visible: action.visible,
            };
    }
};
