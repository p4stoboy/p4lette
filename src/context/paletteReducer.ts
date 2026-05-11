import { ColorCardProps } from "../types/ColorCardProps";
import { ColorMode } from "../types/Colors";
import { Palette } from "../types/Palette";
import { randomHex } from "../functions/color_converters";
import { DEFAULT_NAME_LIST } from "../functions/get_color_card_props";
import { decodePalette } from "../functions/share_url";

export type PaletteState = {
  palette: Palette;
  names: string[];
  exportVisible: boolean;
  exportTemplate: string;
  nameList: string;
  colorMode: ColorMode;
};

export type PaletteAction =
  | { type: "addColor"; hex?: string }
  | { type: "deleteColor"; id: number }
  | { type: "updateColor"; id: number; hex: string }
  | { type: "reorderColor"; fromIndex: number; toIndex: number }
  | { type: "toggleLock"; id: number }
  | { type: "randomizeUnlocked" }
  | { type: "replaceAll"; hexes: string[] }
  | { type: "setNames"; names: string[] }
  | { type: "setExportTemplate"; template: string }
  | { type: "setExportVisible"; visible: boolean }
  | { type: "setNameList"; list: string }
  | { type: "setColorMode"; mode: ColorMode };

const NAME_PLACEHOLDER = "...";

const newDataId = (id: number): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${id}-${Math.random().toString(16).slice(2)}`;

const makeColor = (hex: string, id: number): ColorCardProps => ({
  id,
  hex,
  locked: false,
  dataId: newDataId(id),
});

const renumber = (palette: Palette): Palette =>
  palette.map((c, i) => ({ ...c, id: i }));

const reorderItems = <T>(items: T[], from: number, to: number): T[] => {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return items;
  }
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

export interface CreatePaletteOptions {
  initialCount?: number;
  exportTemplate: string;
  hash?: string | null;
  nameList?: string;
  colorMode?: ColorMode;
}

export const createPaletteState = ({
  initialCount = 5,
  exportTemplate,
  hash,
  nameList = DEFAULT_NAME_LIST,
  colorMode = "hex",
}: CreatePaletteOptions): PaletteState => {
  const decoded = decodePalette(hash ?? null);
  const seed =
    decoded ?? Array.from({ length: initialCount }, () => randomHex());
  return {
    palette: seed.map((hex, id) => makeColor(hex, id)),
    names: seed.map(() => NAME_PLACEHOLDER),
    exportVisible: false,
    exportTemplate,
    nameList,
    colorMode,
  };
};

export const paletteReducer = (
  state: PaletteState,
  action: PaletteAction,
): PaletteState => {
  switch (action.type) {
    case "addColor": {
      const hex = action.hex ?? randomHex();
      return {
        ...state,
        palette: renumber([
          ...state.palette,
          makeColor(hex, state.palette.length),
        ]),
        names: [...state.names, NAME_PLACEHOLDER],
      };
    }
    case "deleteColor": {
      const idx = state.palette.findIndex((c) => c.id === action.id);
      if (idx === -1) return state;
      return {
        ...state,
        palette: renumber(state.palette.filter((_, i) => i !== idx)),
        names: state.names.filter((_, i) => i !== idx),
      };
    }
    case "updateColor": {
      const idx = state.palette.findIndex((c) => c.id === action.id);
      if (idx === -1) return state;
      return {
        ...state,
        palette: state.palette.map((c, i) =>
          i === idx ? { ...c, hex: action.hex } : c,
        ),
        names: state.names.map((n, i) => (i === idx ? NAME_PLACEHOLDER : n)),
      };
    }
    case "reorderColor": {
      return {
        ...state,
        palette: renumber(
          reorderItems(state.palette, action.fromIndex, action.toIndex),
        ),
        names: reorderItems(state.names, action.fromIndex, action.toIndex),
      };
    }
    case "toggleLock": {
      return {
        ...state,
        palette: state.palette.map((c) =>
          c.id === action.id ? { ...c, locked: !c.locked } : c,
        ),
      };
    }
    case "randomizeUnlocked": {
      return {
        ...state,
        palette: state.palette.map((c) =>
          c.locked ? c : { ...c, hex: randomHex() },
        ),
        names: state.palette.map((c, i) =>
          c.locked ? (state.names[i] ?? NAME_PLACEHOLDER) : NAME_PLACEHOLDER,
        ),
      };
    }
    case "replaceAll": {
      return {
        ...state,
        palette: action.hexes.map((hex, id) => makeColor(hex, id)),
        names: action.hexes.map(() => NAME_PLACEHOLDER),
      };
    }
    case "setNames": {
      return {
        ...state,
        names: state.palette.map(
          (_, i) => action.names[i] ?? state.names[i] ?? NAME_PLACEHOLDER,
        ),
      };
    }
    case "setExportTemplate":
      return { ...state, exportTemplate: action.template };
    case "setExportVisible":
      return { ...state, exportVisible: action.visible };
    case "setNameList":
      if (action.list === state.nameList) return state;
      return {
        ...state,
        nameList: action.list,
        names: state.palette.map(() => NAME_PLACEHOLDER),
      };
    case "setColorMode":
      if (action.mode === state.colorMode) return state;
      return { ...state, colorMode: action.mode };
  }
};
