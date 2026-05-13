import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { DisplayMode, EditSpace } from "../types/Colors";
import { PaletteContextProps } from "../types/PaletteContextProps";
import {
  DEFAULT_TEMPLATE,
  resolveTemplate,
} from "../functions/resolve_export_template";
import {
  DEFAULT_NAME_LIST,
  getColorNames,
} from "../functions/get_color_card_props";
import { encodePalette } from "../functions/share_url";
import {
  PaletteState,
  createPaletteState,
  paletteReducer,
} from "./paletteReducer";

const EXPORT_KEY = "p4lette_export_template_v1";
const NAME_LIST_KEY = "p4lette_name_list_v1";
const COLOR_MODE_KEY = "p4lette_color_mode_v1";
const EDIT_SPACE_KEY = "p4lette_edit_space_v1";
const NAMES_DEBOUNCE_MS = 500;
const HASH_DEBOUNCE_MS = 150;
const NAME_PLACEHOLDER = "...";

const VALID_MODES = ["hex", "rgb", "hsl", "hsv", "oklch", "all"] as const;
const VALID_EDIT_SPACES = ["okhsl", "rgb", "hsl", "hsv", "oklch"] as const;

export const PaletteContext = createContext<PaletteContextProps | undefined>(
  undefined,
);

export const usePalette = (): PaletteContextProps => {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error("usePalette must be used within Provider");
  return ctx;
};

const readInitialTemplate = (): string => {
  if (typeof localStorage === "undefined") return DEFAULT_TEMPLATE;
  try {
    return localStorage.getItem(EXPORT_KEY) ?? DEFAULT_TEMPLATE;
  } catch {
    return DEFAULT_TEMPLATE;
  }
};

const readInitialNameList = (): string => {
  if (typeof localStorage === "undefined") return DEFAULT_NAME_LIST;
  try {
    return localStorage.getItem(NAME_LIST_KEY) ?? DEFAULT_NAME_LIST;
  } catch {
    return DEFAULT_NAME_LIST;
  }
};

const readInitialColorMode = (): DisplayMode => {
  if (typeof localStorage === "undefined") return "all";
  try {
    const raw = localStorage.getItem(COLOR_MODE_KEY);
    return VALID_MODES.includes(raw as DisplayMode)
      ? (raw as DisplayMode)
      : "all";
  } catch {
    return "all";
  }
};

const readInitialEditSpace = (): EditSpace => {
  if (typeof localStorage === "undefined") return "okhsl";
  try {
    const raw = localStorage.getItem(EDIT_SPACE_KEY);
    return VALID_EDIT_SPACES.includes(raw as EditSpace)
      ? (raw as EditSpace)
      : "okhsl";
  } catch {
    return "okhsl";
  }
};

const readInitialHash = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.location.hash || null;
};

type ProviderProps = {
  children: ReactNode;
  initialState?: PaletteState;
};

export const Provider = ({ children, initialState }: ProviderProps) => {
  const [state, dispatch] = useReducer(
    paletteReducer,
    undefined,
    () =>
      initialState ??
      createPaletteState({
        exportTemplate: readInitialTemplate(),
        hash: readInitialHash(),
        nameList: readInitialNameList(),
        colorMode: readInitialColorMode(),
        editSpace: readInitialEditSpace(),
      }),
  );
  const {
    palette,
    names,
    exportVisible,
    exportTemplate,
    nameList,
    colorMode,
    editSpace,
    genStrategy,
    genParams,
  } = state;
  const namesRef = useRef<string[]>(names);

  useEffect(() => {
    namesRef.current = names;
  }, [names]);

  const resolvedTemplate = useMemo(
    () => resolveTemplate(exportTemplate, palette, names),
    [exportTemplate, palette, names],
  );

  useEffect(() => {
    if (palette.length === 0) {
      dispatch({ type: "setNames", names: [] });
      return;
    }
    let alive = true;
    const t = setTimeout(async () => {
      const current = namesRef.current;
      const fallbacks = palette.map((c, i) =>
        current[i] && current[i] !== NAME_PLACEHOLDER ? current[i] : c.hex,
      );
      const next = await getColorNames(
        palette.map((c) => c.hex),
        {
          list: nameList,
          fallbacks,
        },
      );
      if (alive) dispatch({ type: "setNames", names: next });
    }, NAMES_DEBOUNCE_MS);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [palette, nameList]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = setTimeout(() => {
      const enc = encodePalette(palette);
      const target = enc ? `#p=${enc}` : "";
      if (window.location.hash !== target) {
        const url = target || window.location.pathname + window.location.search;
        window.history.replaceState(null, "", url);
      }
    }, HASH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [palette]);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(EXPORT_KEY, exportTemplate);
    } catch {
      /* ignore quota */
    }
  }, [exportTemplate]);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(NAME_LIST_KEY, nameList);
    } catch {
      /* ignore quota */
    }
  }, [nameList]);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(COLOR_MODE_KEY, colorMode);
    } catch {
      /* ignore quota */
    }
  }, [colorMode]);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(EDIT_SPACE_KEY, editSpace);
    } catch {
      /* ignore quota */
    }
  }, [editSpace]);

  const addColor = useCallback(
    (hex?: string) => dispatch({ type: "addColor", hex }),
    [],
  );
  const insertColor = useCallback(
    (index: number, hex: string) =>
      dispatch({ type: "insertColor", index, hex }),
    [],
  );
  const deleteColor = useCallback(
    (id: number) => dispatch({ type: "deleteColor", id }),
    [],
  );
  const updateColor = useCallback(
    (id: number, hex: string) => dispatch({ type: "updateColor", id, hex }),
    [],
  );
  const reorderColor = useCallback(
    (fromIndex: number, toIndex: number) =>
      dispatch({ type: "reorderColor", fromIndex, toIndex }),
    [],
  );
  const toggleLock = useCallback(
    (id: number) => dispatch({ type: "toggleLock", id }),
    [],
  );
  const randomizeUnlocked = useCallback(
    () => dispatch({ type: "randomizeUnlocked" }),
    [],
  );
  const replaceAll = useCallback(
    (hexes: string[]) => dispatch({ type: "replaceAll", hexes }),
    [],
  );
  const setExportTemplate = useCallback(
    (template: string) => dispatch({ type: "setExportTemplate", template }),
    [],
  );
  const setExportVisible = useCallback(
    (visible: boolean) => dispatch({ type: "setExportVisible", visible }),
    [],
  );
  const setNameList = useCallback(
    (list: string) => dispatch({ type: "setNameList", list }),
    [],
  );
  const setColorMode = useCallback(
    (mode: DisplayMode) => dispatch({ type: "setColorMode", mode }),
    [],
  );
  const setEditSpace = useCallback(
    (space: EditSpace) => dispatch({ type: "setEditSpace", space }),
    [],
  );
  const setGenConfig = useCallback(
    (cfg: Parameters<PaletteContextProps["setGenConfig"]>[0]) =>
      dispatch({ type: "setGenConfig", ...cfg }),
    [],
  );

  const itf = useMemo<PaletteContextProps>(
    () => ({
      palette,
      names,
      exportVisible,
      exportTemplate,
      resolvedTemplate,
      nameList,
      colorMode,
      editSpace,
      genStrategy,
      genParams,
      addColor,
      insertColor,
      deleteColor,
      updateColor,
      reorderColor,
      toggleLock,
      randomizeUnlocked,
      replaceAll,
      setExportTemplate,
      setExportVisible,
      setNameList,
      setColorMode,
      setEditSpace,
      setGenConfig,
    }),
    [
      palette,
      names,
      exportVisible,
      exportTemplate,
      resolvedTemplate,
      nameList,
      colorMode,
      editSpace,
      genStrategy,
      genParams,
      addColor,
      insertColor,
      deleteColor,
      updateColor,
      reorderColor,
      toggleLock,
      randomizeUnlocked,
      replaceAll,
      setExportTemplate,
      setExportVisible,
      setNameList,
      setColorMode,
      setEditSpace,
      setGenConfig,
    ],
  );

  return (
    <PaletteContext.Provider value={itf}>{children}</PaletteContext.Provider>
  );
};
