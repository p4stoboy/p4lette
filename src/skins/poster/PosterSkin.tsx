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
import { POSTER } from "./tokens";
import { PosterNav } from "./PosterNav";
import { PosterTicker } from "./PosterTicker";
import { PosterColumn } from "./PosterColumn";
import { PosterFooter } from "./PosterFooter";
import { PosterWelcome } from "./PosterWelcome";
import { PosterAbout } from "./PosterAbout";
import { PosterSavedDrawer } from "./PosterSavedDrawer";
import { PosterHarmonyDrawer } from "./PosterHarmonyDrawer";
import { PosterExportSheet } from "./PosterExportSheet";

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
  } = usePalette();

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showAbout, setShowAbout] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !readSeenWelcome());
  const [showExport, setShowExport] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showHarmony, setShowHarmony] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lastEditedId, setLastEditedId] = useState<number | null>(null);
  const [savedList, setSavedList] = useState<SavedPalette[]>(() => loadSaved());
  const [copyLabel, setCopyLabel] = useState("COPY!");
  const [tickRoll, setTickRoll] = useState(0);

  const isDark = theme === "dark";
  const bg = isDark ? POSTER.bgDark : POSTER.bg;
  const ink = isDark ? POSTER.inkDark : POSTER.ink;

  useEffect(() => {
    const i = window.setInterval(() => setTickRoll((t) => t + 1), 50);
    return () => window.clearInterval(i);
  }, []);

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
    else if (showExport) setShowExport(false);
    else if (showHarmony) setShowHarmony(false);
    else if (showSaved) setShowSaved(false);
    else if (showAbout) setShowAbout(false);
    else if (editingId !== null) setEditingId(null);
  }, [
    showWelcome,
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
    columnCount: palette.length,
    paddingX: 20,
    maxFontSize: 38,
    minFontSize: 14,
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
        onTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        onAbout={() => setShowAbout(true)}
        onSaved={() => setShowSaved(true)}
        onHarmony={() => setShowHarmony(true)}
        onExport={() => setShowExport(true)}
        onSave={handleSavePalette}
        onRandomize={randomizeUnlocked}
        onAdd={() => addColor()}
        savedCount={savedList.length}
      />

      <PosterTicker ink={ink} roll={tickRoll} palette={palette} />

      <div
        ref={paletteRef}
        style={{ flex: 1, display: "flex", position: "relative", minHeight: 0 }}
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

      <PosterFooter palette={palette} ink={ink} />

      {showWelcome && (
        <PosterWelcome ink={ink} bg={bg} onClose={dismissWelcome} />
      )}
      {showAbout && (
        <PosterAbout ink={ink} bg={bg} onClose={() => setShowAbout(false)} />
      )}
      {showSaved && (
        <PosterSavedDrawer
          ink={ink}
          bg={bg}
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
        <PosterHarmonyDrawer
          ink={ink}
          bg={bg}
          palette={palette}
          onClose={() => setShowHarmony(false)}
          onApply={(hexes) => {
            replaceAll(hexes);
            setShowHarmony(false);
          }}
        />
      )}
      {showExport && (
        <PosterExportSheet
          ink={ink}
          bg={bg}
          tpl={exportTemplate}
          setTpl={setExportTemplate}
          resolved={resolvedTemplate}
          copyLabel={copyLabel}
          onCopy={onCopy}
          onReset={() => setExportTemplate(DEFAULT_TEMPLATE)}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
};
