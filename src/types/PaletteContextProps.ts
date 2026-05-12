import { DisplayMode, EditSpace } from "./Colors";
import { Palette } from "./Palette";
import { GenStrategy, RampParams } from "../functions/generate_palette";

export interface PaletteContextProps {
  palette: Palette;
  names: string[];
  exportVisible: boolean;
  exportTemplate: string;
  resolvedTemplate: string;
  nameList: string;
  colorMode: DisplayMode;
  editSpace: EditSpace;
  genStrategy: GenStrategy;
  genParams: RampParams | null;
  addColor: (hex?: string) => void;
  insertColor: (index: number, hex: string) => void;
  deleteColor: (id: number) => void;
  updateColor: (id: number, hex: string) => void;
  reorderColor: (fromIndex: number, toIndex: number) => void;
  toggleLock: (id: number) => void;
  randomizeUnlocked: () => void;
  replaceAll: (hexes: string[]) => void;
  setExportTemplate: (template: string) => void;
  setExportVisible: (visible: boolean) => void;
  setNameList: (list: string) => void;
  setColorMode: (mode: DisplayMode) => void;
  setEditSpace: (space: EditSpace) => void;
  setGenConfig: (cfg: {
    strategy?: GenStrategy;
    params?: RampParams | null;
  }) => void;
}
