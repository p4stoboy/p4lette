import { DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { usePalette } from "../../context/PaletteContext";
import {
  SavedPalette,
  loadSaved,
  newSavedId,
  persistSaved,
} from "../../functions/saved_palettes";
import { DEFAULT_TEMPLATE } from "../../functions/resolve_export_template";
import { useFitNameSize } from "../../hooks/use_fit_name_size";
import { useGlobalShortcuts } from "../../hooks/use_global_shortcuts";
import { useTouchDragReorder } from "../../hooks/use_touch_drag_reorder";
import { useViewport } from "../../hooks/use_viewport";
import { TERMINAL } from "./tokens";
import { TerminalCmdBar } from "./TerminalCmdBar";
import { TerminalColumn } from "./TerminalColumn";
import { TerminalTile } from "./TerminalTile";
import { TerminalMobileMenu } from "./TerminalMobileMenu";
import { TerminalStatusline } from "./TerminalStatusline";
import { TerminalWelcome } from "./TerminalWelcome";
import { TerminalAbout } from "./TerminalAbout";
import { TerminalSavedDrawer } from "./TerminalSavedDrawer";
import { TerminalHarmonyDrawer } from "./TerminalHarmonyDrawer";
import { TerminalExportSheet } from "./TerminalExportSheet";

const WELCOME_KEY = "p4lette_seen_welcome_v1";

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

export const TerminalSkin = () => {
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
  } = usePalette();

  const { isMobile } = useViewport();

  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showAbout, setShowAbout] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !readSeenWelcome());
  const [showExport, setShowExport] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showHarmony, setShowHarmony] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lastEditedId, setLastEditedId] = useState<number | null>(null);
  const [savedList, setSavedList] = useState<SavedPalette[]>(() => loadSaved());
  const [copyLabel, setCopyLabel] = useState("[ COPY ]");
  const [clock, setClock] = useState(() => new Date());

  const isDark = theme === "dark";
  const bg = isDark ? TERMINAL.bgDark : TERMINAL.bg;
  const ink = isDark ? TERMINAL.inkDark : TERMINAL.ink;
  const accent = TERMINAL.accent;

  useEffect(() => {
    const i = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(i);
  }, []);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(resolvedTemplate);
      setCopyLabel("[ COPIED ]");
    } catch {
      setCopyLabel("[ FAILED ]");
    }
    window.setTimeout(() => setCopyLabel("[ COPY ]"), 1500);
  }, [resolvedTemplate]);

  const handleSavePalette = useCallback(() => {
    const entry: SavedPalette = {
      id: newSavedId(),
      hexes: palette.map((c) => c.hex),
      createdAt: Date.now(),
    };
    const next = [entry, ...savedList].slice(0, 20);
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

  const dismissWelcome = useCallback(() => {
    setShowWelcome(false);
    markWelcomeSeen();
  }, []);

  const closeAllOverlays = useCallback(() => {
    if (showWelcome) dismissWelcome();
    else if (showMenu) setShowMenu(false);
    else if (showExport) setShowExport(false);
    else if (showHarmony) setShowHarmony(false);
    else if (showSaved) setShowSaved(false);
    else if (showAbout) setShowAbout(false);
    else if (editingId !== null) setEditingId(null);
  }, [
    showWelcome,
    showMenu,
    showExport,
    showHarmony,
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
    paddingX: isMobile ? 14 : 12,
    maxFontSize: isMobile ? 14 : 17,
    minFontSize: 9,
    fontFamily: TERMINAL.mono,
    fontWeight: 700,
    letterSpacing: "-0.01em",
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: bg,
        color: ink,
        fontFamily: TERMINAL.mono,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontSize: 12,
      }}
    >
      <TerminalCmdBar
        ink={ink}
        accent={accent}
        isDark={isDark}
        compact={isMobile}
        palette={palette}
        savedCount={savedList.length}
        clock={clock}
        onTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        onAdd={() => addColor()}
        onShuffle={randomizeUnlocked}
        onSave={handleSavePalette}
        onVault={() => setShowSaved(true)}
        onHarmony={() => setShowHarmony(true)}
        onExport={() => setShowExport(true)}
        onAbout={() => setShowAbout(true)}
        onMenu={() => setShowMenu(true)}
      />

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
            <TerminalTile
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
          <TerminalAddTile ink={ink} accent={accent} onAdd={() => addColor()} />
        </div>
      ) : (
        <div ref={paletteRef} style={{ flex: 1, display: "flex", minHeight: 0 }}>
          {palette.map((c, i) => (
            <TerminalColumn
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
              ink={ink}
            />
          ))}
        </div>
      )}

      {!isMobile && (
        <TerminalStatusline palette={palette} ink={ink} accent={accent} />
      )}

      {showWelcome && (
        <TerminalWelcome
          ink={ink}
          bg={bg}
          accent={accent}
          isMobile={isMobile}
          onClose={dismissWelcome}
        />
      )}
      {showAbout && (
        <TerminalAbout
          ink={ink}
          bg={bg}
          accent={accent}
          isMobile={isMobile}
          onClose={() => setShowAbout(false)}
        />
      )}
      {showSaved && (
        <TerminalSavedDrawer
          ink={ink}
          bg={bg}
          accent={accent}
          isMobile={isMobile}
          list={savedList}
          onClose={() => setShowSaved(false)}
          onLoad={(hexes) => {
            replaceAll(hexes);
            setShowSaved(false);
          }}
          onDelete={removeSaved}
        />
      )}
      {showHarmony && (
        <TerminalHarmonyDrawer
          ink={ink}
          bg={bg}
          accent={accent}
          isMobile={isMobile}
          palette={palette}
          onClose={() => setShowHarmony(false)}
          onApply={(hexes) => {
            replaceAll(hexes);
            setShowHarmony(false);
          }}
        />
      )}
      {showExport && (
        <TerminalExportSheet
          ink={ink}
          bg={bg}
          accent={accent}
          isMobile={isMobile}
          tpl={exportTemplate}
          setTpl={setExportTemplate}
          resolved={resolvedTemplate}
          copyLabel={copyLabel}
          onCopy={onCopy}
          onReset={() => setExportTemplate(DEFAULT_TEMPLATE)}
          onClose={() => setShowExport(false)}
        />
      )}
      {showMenu && (
        <TerminalMobileMenu
          ink={ink}
          bg={bg}
          accent={accent}
          isDark={isDark}
          savedCount={savedList.length}
          onClose={() => setShowMenu(false)}
          onTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          onAdd={() => addColor()}
          onShuffle={randomizeUnlocked}
          onSave={handleSavePalette}
          onVault={() => setShowSaved(true)}
          onHarmony={() => setShowHarmony(true)}
          onExport={() => setShowExport(true)}
          onAbout={() => setShowAbout(true)}
        />
      )}
    </div>
  );
};

interface AddTileProps {
  ink: string;
  accent: string;
  onAdd: () => void;
}

const TerminalAddTile = ({ ink, accent, onAdd }: AddTileProps) => (
  <button
    onClick={onAdd}
    aria-label="add color"
    style={{
      aspectRatio: "1 / 1",
      background: "transparent",
      borderTop: "none",
      borderLeft: "none",
      borderRight: `${TERMINAL.borderW}px solid ${ink}`,
      borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
      color: ink,
      cursor: "pointer",
      fontFamily: TERMINAL.mono,
      fontSize: 28,
      fontWeight: 700,
      letterSpacing: "0.06em",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      touchAction: "manipulation",
    }}
  >
    <span style={{ color: accent }}>$</span>
    <span>add</span>
  </button>
);
