import {Palette} from "./Palette";

export interface PaletteContextProps {
    palette: Palette;
    names: string[];
    add_color: () => void;
    delete_color: (id: number) => void;
    update_color: (id: number, hex: string) => void;
}