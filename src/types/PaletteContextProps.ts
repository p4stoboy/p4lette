import { ColorMode } from "./Colors";
import { Palette } from "./Palette";

export interface PaletteContextProps {
  palette: Palette;
  names: string[];
  exportVisible: boolean;
  exportTemplate: string;
  resolvedTemplate: string;
  nameList: string;
  colorMode: ColorMode;
  addColor: (hex?: string) => void;
  deleteColor: (id: number) => void;
  updateColor: (id: number, hex: string) => void;
  reorderColor: (fromIndex: number, toIndex: number) => void;
  toggleLock: (id: number) => void;
  randomizeUnlocked: () => void;
  replaceAll: (hexes: string[]) => void;
  setExportTemplate: (template: string) => void;
  setExportVisible: (visible: boolean) => void;
  setNameList: (list: string) => void;
  setColorMode: (mode: ColorMode) => void;
}
