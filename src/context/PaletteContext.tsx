import {createContext, useEffect, useState} from "react";
import {Palette} from "../types/Palette";
import {get_color_card_props, get_color_name} from "../functions/get_color_card_props";
import {random_hex} from "../functions/color_converters";
import {PaletteContextProps} from "../types/PaletteContextProps";
import { v4 } from 'uuid';
import {resolve_template} from "../functions/resolve_export_template";

// @ts-ignore
export const PaletteContext = createContext<PaletteContextProps>({});
const instructions = "// ALL VALUE LITERALS BETWEEN $\n" +
    "const ONE_HEX = $1.hex$;\n" +
    "// you can put any text / syntax you want around the literals; highlighting is set to javascript\n" +
    "\n" +
    "// COLORS ARE REFERENCED BY ID FROM LEFT TO RIGHT (STARTING AT 1)\n" +
    "const ONE = $1$;\n" +
    "\n" +
    "// COLOR PROPERTIES = {name, hex, hsl, rgb}\n" +
    "const ONE_NAME = $1.name$;\n" +
    "const ONE_HSL = $1.hsl$;\n" +
    "// ETC.\n" +
    "\n" +
    "// ARRAY STRUCTURING\n" +
    "const palette = {\n" +
    "  ONE_AND_THREE: $[1, 3]$,\n" +
    "  ONE_AND_THREE_HEX: $[1,3].hex$,\n" +
    "  // ALL KEYWORD (ACCEPTS PROPERTIES)\n" +
    "  ALL_HEX: $[all].hex$\n" +
    "};\n" +
    "\n" +
    "// YOUR OWN INTERFACE:\n" +
    "const my_palette = {\n" +
    "  name: \"my palette name\",\n" +
    "  water: $[1,2].hex$,\n" +
    "  ground: $[3,4].hex$\n" +
    "};"

export const Provider = ({children}: any) => {
    const [palette, setPalette] = useState<Palette>([]);
    const [names, setNames] = useState<string[]>([]);
    //trigger name update
    const [trigger, doTrigger] = useState<number>(0);
    const [export_visible, setExportVisible] = useState<boolean>(false);
    const [export_template, setExportTemplate] = useState<string>(instructions);
    const [resolved_template, setResolvedTemplate] = useState<string>("");
    const update_names =  async () => {
        const new_names = await Promise.all(palette.map(async (color) => {
            return await get_color_name(color.hex);
        }));
        setNames(new_names);
        setResolvedTemplate(resolve_template(export_template, palette, new_names));
    };

    const itf = {
        palette,
        names,
        trigger,
        export_template,
        export_visible,
        instructions,
        resolved_template,
        setPalette,
        setNames,
        doTrigger,
        setExportTemplate,
        setExportVisible,
        setResolvedTemplate,
        delete_color: (id: number) => {
            setPalette(palette.filter((color) => color.id !== id)
                .map((color, i) => ({...color, id: i})));
            setNames(names.filter((name, i) => i !== id));
        },
        add_color: (amount: number = 1) => {
            const new_colors = [];
            for (let i = 0; i < amount; i++) {
                const new_color_props = get_color_card_props(random_hex(), palette.length + i, v4());
                new_colors.push(new_color_props);
            }
            setPalette([...palette, ...new_colors]);
            doTrigger(trigger + 1);
        },
        update_color: (id: number, hex: string, data_id: string) => {
            const new_palette = [...palette];
            new_palette[id] = get_color_card_props(hex, id, data_id);
            setNames(names.map((name, i) => i === id ? "Loading..." : name));
            setPalette(new_palette);
            doTrigger(trigger + 1);
        },
    }

    //don't update name until user stops changing state
    useEffect(() => {
            const timeout = setTimeout(() => {
                update_names();
            }, 600);
            return () => {
                clearTimeout(timeout);
            };
    }, [trigger]);

    useEffect(() => {
        itf.add_color(3);
    }, []);

return (
        <PaletteContext.Provider value={itf}>
            {children}
        </PaletteContext.Provider>
    );
}