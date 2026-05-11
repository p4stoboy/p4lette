import { DragEvent, useCallback, useRef, useState } from "react";
import { usePalette } from "../../context/PaletteContext";
import {
  SAVED_LIMIT,
  SavedPalette,
  defaultPaletteName,
  loadSaved,
  newSavedId,
  persistSaved,
} from "../../functions/saved_palettes";
import {
  SAVED_TEMPLATES_LIMIT,
  SavedTemplate,
  loadSavedTemplates,
  newSavedTemplateId,
  persistSavedTemplates,
} from "../../functions/saved_templates";
import { DEFAULT_TEMPLATE } from "../../functions/resolve_export_template";
import { useFitNameSize } from "../../hooks/use_fit_name_size";
import { useGlobalShortcuts } from "../../hooks/use_global_shortcuts";
import { useTouchDragReorder } from "../../hooks/use_touch_drag_reorder";
import { useViewport } from "../../hooks/use_viewport";
import { POSTER } from "./tokens";
import { PosterNav } from "./PosterNav";
import { PosterTicker } from "./PosterTicker";
import { PosterColumn } from "./PosterColumn";
import { PosterTile } from "./PosterTile";
import { PosterMobileMenu } from "./PosterMobileMenu";
import { PosterFooter } from "./PosterFooter";
import { PosterWelcome } from "./PosterWelcome";
import { PosterAbout } from "./PosterAbout";
import { PosterSavedDrawer } from "./PosterSavedDrawer";
import { PosterHarmonyDrawer } from "./PosterHarmonyDrawer";
import { PosterTonesDrawer } from "./PosterTonesDrawer";
import { PosterExportSheet } from "./PosterExportSheet";
import { PosterNamingSheet } from "./PosterNamingSheet";

const WELCOME_KEY = "p4lette_seen_welcome_v1";
const TICKER_KEY = "p4lette_ticker_v1";

const readSeenWelcome = (): boolean => {
  if (typeof localStorage === "undefined") return true;
  try {
    return localStorage.getItem(WELCOME_KEY) === "1";
  } catch {
    return true;
  }
};

const markWelcomeSeen = () => {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(WELCOME_KEY, "1");
  } catch {
    /* ignore */
  }
};

const readTickerVisible = (): boolean => {
  if (typeof localStorage === "undefined") return true;
  try {
    return localStorage.getItem(TICKER_KEY) !== "0";
  } catch {
    return true;
  }
};

export const PosterSkin = () => {
  const {
    palette,
    names,
    resolvedTemplate,
    addColor,
    deleteColor,
    updateColor,
    reorderColor,
    toggleLock,
    randomizeUnlocked,
    replaceAll,
    exportTemplate,
    setExportTemplate,
    nameList,
  } = usePalette();

  const { isMobile } = useViewport();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showAbout, setShowAbout] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !readSeenWelcome());
  const [showExport, setShowExport] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showHarmony, setShowHarmony] = useState(false);
  const [showTones, setShowTones] = useState(false);
  const [showNaming, setShowNaming] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lastEditedId, setLastEditedId] = useState<number | null>(null);
  const [savedList, setSavedList] = useState<SavedPalette[]>(() => loadSaved());
  const [templateList, setTemplateList] = useState<SavedTemplate[]>(() =>
    loadSavedTemplates(),
  );
  const [copyLabel, setCopyLabel] = useState("COPY!");
  const [tickerVisible, setTickerVisible] = useState(readTickerVisible);

  const toggleTicker = useCallback(() => {
    setTickerVisible((v) => {
      const next = !v;
      try {
        if (typeof localStorage !== "undefined")
          localStorage.setItem(TICKER_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const isDark = theme === "dark";
  const bg = isDark ? POSTER.bgDark : POSTER.bg;
  const ink = isDark ? POSTER.inkDark : POSTER.ink;

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(resolvedTemplate);
      setCopyLabel("COPIED ✓");
    } catch {
      setCopyLabel("FAILED");
    }
    window.setTimeout(() => setCopyLabel("COPY!"), 1500);
  }, [resolvedTemplate]);

  const handleSavePalette = useCallback(() => {
    const fallback = defaultPaletteName(Date.now());
    const raw =
      typeof window !== "undefined"
        ? window.prompt("Name this palette", fallback)
        : fallback;
    if (raw === null) return;
    const entry: SavedPalette = {
      id: newSavedId(),
      name: raw.trim() || fallback,
      hexes: palette.map((c) => c.hex),
      createdAt: Date.now(),
    };
    const next = [entry, ...savedList].slice(0, SAVED_LIMIT);
    setSavedList(next);
    persistSaved(next);
  }, [palette, savedList]);

  const removeSaved = useCallback(
    (id: string) => {
      const next = savedList.filter((s) => s.id !== id);
      setSavedList(next);
      persistSaved(next);
    },
    [savedList],
  );

  const handleSaveTemplate = useCallback(() => {
    const stamp = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const fallback = `template-${stamp.getFullYear()}-${pad(stamp.getMonth() + 1)}-${pad(stamp.getDate())}-${pad(stamp.getHours())}${pad(stamp.getMinutes())}`;
    const raw =
      typeof window !== "undefined"
        ? window.prompt("Name this template", fallback)
        : fallback;
    if (raw === null) return;
    const name = raw.trim() || fallback;
    const entry: SavedTemplate = {
      id: newSavedTemplateId(),
      name,
      body: exportTemplate,
      createdAt: Date.now(),
    };
    const next = [entry, ...templateList].slice(0, SAVED_TEMPLATES_LIMIT);
    setTemplateList(next);
    persistSavedTemplates(next);
  }, [exportTemplate, templateList]);

  const removeTemplate = useCallback(
    (id: string) => {
      const next = templateList.filter((t) => t.id !== id);
      setTemplateList(next);
      persistSavedTemplates(next);
    },
    [templateList],
  );

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    markWelcomeSeen();
  }, []);

  const closeAllOverlays = useCallback(() => {
    if (showWelcome) dismissWelcome();
    else if (showMenu) setShowMenu(false);
    else if (showNaming) setShowNaming(false);
    else if (showExport) setShowExport(false);
    else if (showHarmony) setShowHarmony(false);
    else if (showTones) setShowTones(false);
    else if (showSaved) setShowSaved(false);
    else if (showAbout) setShowAbout(false);
    else if (editingId !== null) setEditingId(null);
  }, [
    showWelcome,
    showMenu,
    showNaming,
    showExport,
    showHarmony,
    showTones,
    showSaved,
    showAbout,
    editingId,
    dismissWelcome,
  ]);

  const handleLockShortcut = useCallback(() => {
    const target = lastEditedId ?? palette[0]?.id;
    if (target !== undefined) toggleLock(target);
  }, [lastEditedId, palette, toggleLock]);

  useGlobalShortcuts({
    onShuffle: randomizeUnlocked,
    onLock: handleLockShortcut,
    onExport: () => setShowExport((v) => !v),
    onHarmony: () => setShowHarmony((v) => !v),
    onAbout: () => setShowAbout((v) => !v),
    onEsc: closeAllOverlays,
  });

  const dragFrom = useRef<number | null>(null);
  const onDragStart = (i: number) => (e: DragEvent<HTMLDivElement>) => {
    dragFrom.current = i;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (i: number) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (dragFrom.current !== null && dragFrom.current !== i) {
      reorderColor(dragFrom.current, i);
      dragFrom.current = i;
    }
  };

  const touchHandlers = useTouchDragReorder({ onReorder: reorderColor });

  const paletteRef = useRef<HTMLDivElement>(null);
  const nameFontSize = useFitNameSize({
    names,
    containerRef: paletteRef,
    columnCount: isMobile ? 2 : palette.length,
    paddingX: isMobile ? 16 : 20,
    maxFontSize: isMobile ? 28 : 38,
    minFontSize: isMobile ? 12 : 14,
    fontFamily: POSTER.display,
    fontWeight: 400,
    letterSpacing: "-0.02em",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: bg,
        color: ink,
        fontFamily: POSTER.body,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PosterNav
        ink={ink}
        bg={bg}
        isDark={isDark}
        compact={isMobile}
        tickerVisible={tickerVisible}
        onTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        onAbout={() => setShowAbout(true)}
        onSaved={() => setShowSaved(true)}
        onHarmony={() => setShowHarmony(true)}
        onTones={() => setShowTones(true)}
        onExport={() => setShowExport(true)}
        onRandomize={randomizeUnlocked}
        onAdd={() => addColor()}
        onMenu={() => setShowMenu(true)}
        onToggleTicker={toggleTicker}
        savedCount={savedList.length}
      />

      {!isMobile && tickerVisible && (
        <PosterTicker ink={ink} palette={palette} nameList={nameList} />
      )}

      {isMobile ? (
        <div
          ref={paletteRef}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridAutoRows: "max-content",
            alignContent: "start",
            gap: 0,
            overscrollBehavior: "contain",
            position: "relative",
          }}
        >
          {palette.map((c, i) => (
            <PosterTile
              key={c.dataId}
              color={c}
              name={names[i] || "..."}
              index={i}
              editing={editingId === c.id}
              nameFontSize={nameFontSize}
              ink={ink}
              onEdit={() => {
                setEditingId(c.id);
                setLastEditedId(c.id);
              }}
              onCloseEdit={() => setEditingId(null)}
              onUpdate={(hex) => {
                updateColor(c.id, hex);
                setLastEditedId(c.id);
              }}
              onDelete={() => {
                deleteColor(c.id);
                setEditingId(null);
              }}
              onLock={() => {
                toggleLock(c.id);
                setLastEditedId(c.id);
              }}
              onDragStart={onDragStart(i)}
              onDragOver={onDragOver(i)}
              onPointerDown={touchHandlers.onPointerDown(i)}
              onPointerMove={touchHandlers.onPointerMove}
              onPointerUp={touchHandlers.onPointerUp}
              onPointerCancel={touchHandlers.onPointerCancel}
            />
          ))}
          <PosterAddTile ink={ink} onAdd={() => addColor()} />
        </div>
      ) : (
        <div
          ref={paletteRef}
          style={{
            flex: 1,
            display: "flex",
            position: "relative",
            minHeight: 0,
          }}
        >
          {palette.map((c, i) => (
            <PosterColumn
              key={c.dataId}
              color={c}
              name={names[i] || "..."}
              index={i}
              editing={editingId === c.id}
              nameFontSize={nameFontSize}
              onEdit={() => {
                setEditingId(c.id);
                setLastEditedId(c.id);
              }}
              onCloseEdit={() => setEditingId(null)}
              onUpdate={(hex) => {
                updateColor(c.id, hex);
                setLastEditedId(c.id);
              }}
              onDelete={() => {
                deleteColor(c.id);
                setEditingId(null);
              }}
              onLock={() => {
                toggleLock(c.id);
                setLastEditedId(c.id);
              }}
              onDragStart={onDragStart(i)}
              onDragOver={onDragOver(i)}
              onPointerDown={touchHandlers.onPointerDown(i)}
              onPointerMove={touchHandlers.onPointerMove}
              onPointerUp={touchHandlers.onPointerUp}
              onPointerCancel={touchHandlers.onPointerCancel}
            />
          ))}
        </div>
      )}

      {!isMobile && <PosterFooter palette={palette} ink={ink} bg={bg} />}

      {showWelcome && (
        <PosterWelcome
          ink={ink}
          bg={bg}
          isMobile={isMobile}
          onClose={dismissWelcome}
        />
      )}
      {showAbout && (
        <PosterAbout
          ink={ink}
          bg={bg}
          isMobile={isMobile}
          onClose={() => setShowAbout(false)}
        />
      )}
      {showSaved && (
        <PosterSavedDrawer
          ink={ink}
          bg={bg}
          isMobile={isMobile}
          list={savedList}
          onClose={() => setShowSaved(false)}
          onSave={handleSavePalette}
          onLoad={(hexes) => {
            replaceAll(hexes);
            setShowSaved(false);
          }}
          onDelete={removeSaved}
        />
      )}
      {showHarmony && (
        <PosterHarmonyDrawer
          ink={ink}
          bg={bg}
          isMobile={isMobile}
          palette={palette}
          onClose={() => setShowHarmony(false)}
          onApply={(hexes) => {
            replaceAll(hexes);
            setShowHarmony(false);
          }}
        />
      )}
      {showTones && (
        <PosterTonesDrawer
          ink={ink}
          bg={bg}
          isMobile={isMobile}
          palette={palette}
          onClose={() => setShowTones(false)}
          onApply={(hexes) => {
            replaceAll(hexes);
            setShowTones(false);
          }}
        />
      )}
      {showExport && (
        <PosterExportSheet
          ink={ink}
          bg={bg}
          isMobile={isMobile}
          tpl={exportTemplate}
          setTpl={setExportTemplate}
          resolved={resolvedTemplate}
          copyLabel={copyLabel}
          templates={templateList}
          onCopy={onCopy}
          onReset={() => setExportTemplate(DEFAULT_TEMPLATE)}
          onSaveTemplate={handleSaveTemplate}
          onLoadTemplate={(body) => setExportTemplate(body)}
          onDeleteTemplate={removeTemplate}
          onClose={() => setShowExport(false)}
        />
      )}
      {showMenu && (
        <PosterMobileMenu
          ink={ink}
          bg={bg}
          isDark={isDark}
          savedCount={savedList.length}
          nameList={nameList}
          tickerVisible={tickerVisible}
          onClose={() => setShowMenu(false)}
          onTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          onAdd={() => addColor()}
          onRandomize={randomizeUnlocked}
          onSaved={() => setShowSaved(true)}
          onHarmony={() => setShowHarmony(true)}
          onTones={() => setShowTones(true)}
          onExport={() => setShowExport(true)}
          onAbout={() => setShowAbout(true)}
          onNaming={() => setShowNaming(true)}
          onToggleTicker={toggleTicker}
        />
      )}
      {showNaming && (
        <PosterNamingSheet
          ink={ink}
          bg={bg}
          onClose={() => setShowNaming(false)}
        />
      )}
    </div>
  );
};

interface AddTileProps {
  ink: string;
  onAdd: () => void;
}

const PosterAddTile = ({ ink, onAdd }: AddTileProps) => (
  <button
    onClick={onAdd}
    aria-label="add color"
    style={{
      aspectRatio: "1 / 1",
      background: "transparent",
      border: "none",
      borderRight: `1px solid ${ink}`,
      borderBottom: `1px solid ${ink}`,
      color: ink,
      cursor: "pointer",
      fontFamily: POSTER.display,
      fontSize: 56,
      lineHeight: 1,
      letterSpacing: "-0.02em",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      touchAction: "manipulation",
    }}
  >
    ＋
  </button>
);
