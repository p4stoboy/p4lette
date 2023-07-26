import {Palette} from "./Palette";

export interface PaletteContextProps {
    export_visible: boolean;
    export_template: string;
    palette: Palette;
    names: string[];
    trigger: number,
    add_color: () => void;
    delete_color: (id: number) => void;
    update_color: (id: number, hex: string, data_id: string) => void;
    setPalette: (palette: Palette) => void;
    setNames: (names: string[]) => void;
    doTrigger: (trigger: number) => void;
    setExportTemplate: (template: string) => void;
    setExportVisible: (visible: boolean) => void;
}