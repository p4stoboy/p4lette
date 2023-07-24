import {createContext, useEffect, useState} from "react";
import {Palette} from "../types/Palette";
import {get_color_card_props, get_color_name} from "../functions/get_color_card_props";
import {random_hex} from "../functions/color_converters";
import {PaletteContextProps} from "../types/PaletteContextProps";

// @ts-ignore
export const PaletteContext = createContext<PaletteContextProps>({});

export const Provider = ({children}: any) => {
    const [palette, setPalette] = useState<Palette>([]);
    const [names, setNames] = useState<string[]>([]);

    const update_names =  async () => {
        const new_names = await Promise.all(palette.map(async (color) => {
            return await get_color_name(color.hex);
        }));
        setNames(new_names);
    };

    const itf = {
        palette,
        names,
        delete_color: (id: number) => {
            setPalette(palette.filter((color) => color.id !== id)
                .map((color, i) => ({...color, id: i})));
            setNames(names.filter((name, i) => i !== id));
        },
        add_color: (amount: number = 1) => {
            const new_colors = [];
            for (let i = 0; i < amount; i++) {
                const new_color_props = get_color_card_props(random_hex(), palette.length + i);
                new_colors.push(new_color_props);
            }
            setPalette([...palette, ...new_colors]);
        },
        update_color: (id: number, hex: string) => {
            const new_palette = [...palette];
            new_palette[id] = get_color_card_props(hex, id);
            setPalette(new_palette);
        },
    }

    //don't update name until user stops changing color value
    useEffect(() => {
            const timeout = setTimeout(() => {
                update_names();
            }, 600);
            return () => {
                clearTimeout(timeout);
            };
    }, [palette]);

    // useEffect(() => {
    //     console.log(names);
    // }, [names]);
    useEffect(() => {
        itf.add_color(3);
    }, []);
return (
        <PaletteContext.Provider value={itf}>
            {children}
        </PaletteContext.Provider>
    );
}