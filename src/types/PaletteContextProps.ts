import {Palette} from "./Palette";

export interface PaletteContextProps {
    instructions: string;
    export_visible: boolean;
    export_template: string;
    resolved_template: string;
    palette: Palette;
    names: string[];
    addColors: (amount?: number) => void;
    deleteColor: (id: number) => void;
    updateColor: (id: number, hex: string, data_id: string) => void;
    reorderColor: (fromIndex: number, toIndex: number) => void;
    setExportTemplate: (template: string) => void;
    setExportVisible: (visible: boolean) => void;
}
