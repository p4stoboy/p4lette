import {ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef} from "react";
import {get_color_card_props, get_color_name} from "../functions/get_color_card_props";
import {random_hex} from "../functions/color_converters";
import {PaletteContextProps} from "../types/PaletteContextProps";
import {resolve_template} from "../functions/resolve_export_template";
import {PaletteState, createPaletteState, paletteReducer} from "./paletteReducer";

const instructions = "// refer to any color by its id:\n" +
    "$1$\n" +
    "\n" +
    "// refer to any property (name, hex, rgb, hsl):\n" +
    "$1.hex$\n" +
    "\n" +
    "// arrays:\n" +
    "$[1,3].name$\n" +
    "\n" +
    "// write your own interface and copy it in to your IDE:\n" +
    "{\n" +
    "  main: $[1].hex$,\n" +
    "  shades: $[2,3].hex$\n" +
    "}"

export const PaletteContext = createContext<PaletteContextProps | undefined>(undefined);

export const usePalette = (): PaletteContextProps => {
    const context = useContext(PaletteContext);
    if (!context) throw new Error("usePalette must be used within Provider");
    return context;
};

const get_initial_template = (): string => {
    if (typeof localStorage === "undefined") return instructions;
    return localStorage.getItem("export_template") ?? instructions;
};

const createDataId = (): string => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

type ProviderProps = {
    children: ReactNode;
    initialState?: PaletteState;
};

export const Provider = ({children, initialState}: ProviderProps) => {
    const [state, dispatch] = useReducer(
        paletteReducer,
        initialState ?? createPaletteState(get_initial_template())
    );
    const {palette, names, export_visible, export_template} = state;
    const namesRef = useRef<string[]>([]);

    const resolved_template = useMemo(
        () => resolve_template(export_template, palette, names),
        [export_template, palette, names]
    );

    useEffect(() => {
        namesRef.current = names;
    }, [names]);

    const deleteColor = useCallback((id: number) => {
        dispatch({type: "deleteColor", id});
    }, []);

    const addColors = useCallback((amount: number = 1) => {
        const safeAmount = Math.max(0, Math.floor(amount));
        if (safeAmount === 0) return;

        const colors = Array.from({length: safeAmount}, () =>
            get_color_card_props(random_hex(), 0, createDataId())
        );
        dispatch({type: "addColors", colors});
    }, []);

    const updateColor = useCallback((id: number, hex: string, data_id: string) => {
        dispatch({
            type: "updateColor",
            id,
            color: get_color_card_props(hex, id, data_id),
        });
    }, []);

    const reorderColor = useCallback((fromIndex: number, toIndex: number) => {
        dispatch({type: "reorderColor", fromIndex, toIndex});
    }, []);

    // Don't update color names until the user stops changing palette state.
    useEffect(() => {
        if (palette.length === 0) {
            dispatch({type: "setNames", names: []});
            return;
        }

        let is_current = true;
        const timeout = setTimeout(async () => {
            const currentNames = namesRef.current;
            const new_names = await Promise.all(palette.map(async (color, i) => {
                const fallbackName = currentNames[i] && currentNames[i] !== "Loading..."
                    ? currentNames[i]
                    : color.hex;
                return get_color_name(color.hex, fallbackName);
            }));

            if (is_current) dispatch({type: "setNames", names: new_names});
        }, 600);

        return () => {
            is_current = false;
            clearTimeout(timeout);
        };
    }, [palette]);

    useEffect(() => {
        if (!initialState) addColors(3);
    }, [addColors, initialState]);

    useEffect(() => {
        if (typeof localStorage !== "undefined") localStorage.setItem("export_template", export_template);
    }, [export_template]);

    const setExportTemplate = useCallback((template: string) => {
        dispatch({type: "setExportTemplate", template});
    }, []);

    const setExportVisible = useCallback((visible: boolean) => {
        dispatch({type: "setExportVisible", visible});
    }, []);

    const itf = useMemo<PaletteContextProps>(() => ({
        palette,
        names,
        export_template,
        export_visible,
        instructions,
        resolved_template,
        setExportTemplate,
        setExportVisible,
        deleteColor,
        addColors,
        updateColor,
        reorderColor,
    }), [
        palette,
        names,
        export_template,
        export_visible,
        resolved_template,
        setExportTemplate,
        setExportVisible,
        deleteColor,
        addColors,
        updateColor,
        reorderColor,
    ]);

    return (
        <PaletteContext.Provider value={itf}>
            {children}
        </PaletteContext.Provider>
    );
}
