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
import { PaletteContextProps } from "../types/PaletteContextProps";
import {
  DEFAULT_TEMPLATE,
  resolveTemplate,
} from "../functions/resolve_export_template";
import { getColorNames } from "../functions/get_color_card_props";
import { encodePalette } from "../functions/share_url";
import {
  PaletteState,
  createPaletteState,
  paletteReducer,
} from "./paletteReducer";

const EXPORT_KEY = "p4lette_export_template_v1";
const NAMES_DEBOUNCE_MS = 500;
const HASH_DEBOUNCE_MS = 150;
const NAME_PLACEHOLDER = "...";

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
      }),
  );
  const { palette, names, exportVisible, exportTemplate } = state;
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
        fallbacks,
      );
      if (alive) dispatch({ type: "setNames", names: next });
    }, NAMES_DEBOUNCE_MS);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [palette]);

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

  const addColor = useCallback(
    (hex?: string) => dispatch({ type: "addColor", hex }),
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

  const itf = useMemo<PaletteContextProps>(
    () => ({
      palette,
      names,
      exportVisible,
      exportTemplate,
      resolvedTemplate,
      addColor,
      deleteColor,
      updateColor,
      reorderColor,
      toggleLock,
      randomizeUnlocked,
      replaceAll,
      setExportTemplate,
      setExportVisible,
    }),
    [
      palette,
      names,
      exportVisible,
      exportTemplate,
      resolvedTemplate,
      addColor,
      deleteColor,
      updateColor,
      reorderColor,
      toggleLock,
      randomizeUnlocked,
      replaceAll,
      setExportTemplate,
      setExportVisible,
    ],
  );

  return (
    <PaletteContext.Provider value={itf}>{children}</PaletteContext.Provider>
  );
};
