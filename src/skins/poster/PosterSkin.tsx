import { DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { usePalette } from "../../context/PaletteContext";
import { ColorCardProps } from "../../types/ColorCardProps";
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
import { PosterToolsTray } from "./PosterToolsTray";
import { PosterExportSheet } from "./PosterExportSheet";
import { PosterSettingsDrawer, ThemeChoice } from "./PosterSettingsDrawer";

const WELCOME_KEY = "p4lette_seen_welcome_v1";
const TICKER_KEY = "p4lette_ticker_v1";
const THEME_KEY = "p4lette_theme_v1";

// A hovered column widens to this so its EDIT/LOCK/REMOVE stack has room — but only
// if its fair share of the strip (`stripW / palette.length`) is currently below it;
// a few-colour strip is already roomy, so hovering one then changes no widths.
const EXPAND_TARGET = 340;
// The editing column's flex basis — the prototype's `min(max(EXPAND_TARGET·1.2, 45%),
// 65%)`, in CSS so the `%` resolves against the strip without measuring it.
const EDITING_FLEX = "0 0 min(max(408px, 45%), 65%)";
// Don't freeze widths around an insert if doing so would crush the new colour below this.
const MIN_NEW_COLUMN_PX = 120;

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

// The ticker is opt-in: visible only when the user has explicitly turned it on
// (a stored `"1"`). No key, or a stored `"0"`, → off.
const readTickerVisible = (): boolean => {
  if (typeof localStorage === "undefined") return false;
  try {
    return localStorage.getItem(TICKER_KEY) === "1";
  } catch {
    return false;
  }
};

// Tri-state theme: SYSTEM (follow the OS), LIGHT, DARK. Default SYSTEM.
const readTheme = (): ThemeChoice => {
  if (typeof localStorage === "undefined") return "system";
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw === "light" || raw === "dark" || raw === "system"
      ? raw
      : "system";
  } catch {
    return "system";
  }
};

const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";
const readSystemPrefersDark = (): boolean =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(SYSTEM_DARK_QUERY).matches
    : false;

export const PosterSkin = () => {
  const {
    palette,
    names,
    resolvedTemplate,
    addColor,
    insertColor,
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

  const [theme, setThemeState] = useState<ThemeChoice>(readTheme);
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    readSystemPrefersDark,
  );
  const [showAbout, setShowAbout] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !readSeenWelcome());
  const [showExport, setShowExport] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [lastEditedId, setLastEditedId] = useState<number | null>(null);
  const [savedList, setSavedList] = useState<SavedPalette[]>(() => loadSaved());
  const [templateList, setTemplateList] = useState<SavedTemplate[]>(() =>
    loadSavedTemplates(),
  );
  const [copyLabel, setCopyLabel] = useState("COPY!");
  const [tickerVisible, setTickerVisible] = useState(readTickerVisible);
  // True while the desktop side-panel slot is playing its slide-away exit; the
  // show* flags drop in the slot's onAnimationEnd. (Mobile panels self-animate.)
  const [panelClosing, setPanelClosing] = useState(false);
  // Strip-level state for the per-column hover-expand + the Coolors-style insert.
  // `hoveredId`/`frozen` track by `dataId` — stable across `insertColor`'s id-renumber.
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredExpands, setHoveredExpands] = useState(false);
  const [frozen, setFrozen] = useState<{
    side: "left" | "right";
    widths: Record<string, number>;
  } | null>(null);
  const colRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const setTheme = useCallback((t: ThemeChoice) => {
    setThemeState(t);
    try {
      if (typeof localStorage !== "undefined")
        localStorage.setItem(THEME_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  // Track the OS colour-scheme preference (only matters while theme === "system").
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    )
      return;
    const mq = window.matchMedia(SYSTEM_DARK_QUERY);
    const onChange = () => setSystemPrefersDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && systemPrefersDark);
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

  const handleSavePalette = useCallback(
    (name: string) => {
      const entry: SavedPalette = {
        id: newSavedId(),
        name: name.trim() || defaultPaletteName(Date.now()),
        hexes: palette.map((c) => c.hex),
        createdAt: Date.now(),
      };
      const next = [entry, ...savedList].slice(0, SAVED_LIMIT);
      setSavedList(next);
      persistSaved(next);
    },
    [palette, savedList],
  );

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

  // Tools, export and settings share the desktop side-panel slot, so opening one
  // closes the others (and cancels any in-flight slide-away).
  const openTools = useCallback(() => {
    setShowExport(false);
    setShowSettings(false);
    setPanelClosing(false);
    setShowTools(true);
  }, []);
  const openExport = useCallback(() => {
    setShowTools(false);
    setShowSettings(false);
    setPanelClosing(false);
    setShowExport(true);
  }, []);
  const openSettings = useCallback(() => {
    setShowTools(false);
    setShowExport(false);
    setPanelClosing(false);
    setShowSettings(true);
  }, []);
  // Close whichever side panel is open. Desktop: flip panelClosing → the slot
  // plays sidePanelOutRight, then its onAnimationEnd drops the flags. Mobile:
  // the panel component plays its own exit, so just drop the flags here.
  const closeSidePanel = useCallback(() => {
    if (isMobile) {
      setShowTools(false);
      setShowExport(false);
      setShowSettings(false);
    } else {
      setPanelClosing(true);
    }
  }, [isMobile]);

  const closeAllOverlays = useCallback(() => {
    if (showWelcome) dismissWelcome();
    else if (showMenu) setShowMenu(false);
    else if (showExport || showTools || showSettings) closeSidePanel();
    else if (showAbout) setShowAbout(false);
    else if (editingId !== null) setEditingId(null);
  }, [
    showWelcome,
    showMenu,
    showExport,
    showTools,
    showSettings,
    showAbout,
    editingId,
    dismissWelcome,
    closeSidePanel,
  ]);

  const handleLockShortcut = useCallback(() => {
    const target = lastEditedId ?? palette[0]?.id;
    if (target !== undefined) toggleLock(target);
  }, [lastEditedId, palette, toggleLock]);

  useGlobalShortcuts({
    onShuffle: randomizeUnlocked,
    onLock: handleLockShortcut,
    onExport: () => (showExport ? closeSidePanel() : openExport()),
    onHarmony: () => (showTools ? closeSidePanel() : openTools()),
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

  // --- per-column hover-expand + insert-between ---------------------------------
  // Cursor entered / left a column. On enter (when not mid-insert): track it, and
  // grow it to EXPAND_TARGET iff its fair share of the strip is currently narrower
  // than that. On leave of the tracked column: drop the expand and any post-insert
  // width freeze. While `frozen`, a *different* column entering is ignored — the
  // just-inserted one appears under the cursor and must not steal the hover.
  const handleColumnHover = (dataId: string, hovered: boolean) => {
    if (!hovered) {
      if (hoveredId === dataId) {
        setHoveredId(null);
        setHoveredExpands(false);
        setFrozen(null);
      }
      return;
    }
    if (frozen) return;
    const w = paletteRef.current?.getBoundingClientRect().width ?? 0;
    setHoveredId(dataId);
    setHoveredExpands(w > 0 && w / palette.length < EXPAND_TARGET);
  };

  // Insert a colour next to the column at `index`. `side` is which side stays put:
  // a left-"+" inserts before the column (pin it + everything right → "right"); a
  // right-"+" inserts after it (pin it + everything left → "left"). Snapshot the
  // current widths so the pinned side doesn't move while the new colour grows into
  // the fluid side. On the *first* insert near a hovered column, if pinning would
  // crush the new colour below MIN_NEW_COLUMN_PX we skip the freeze and just
  // rebalance (the degenerate few-column case). Once frozen, stay frozen across
  // repeated inserts — the pinned side never grows (inserts land in the fluid
  // zone), so the hovered column never drifts; new colours just take a thinner
  // fluid share until the cursor leaves and everything rebalances. Closes any open
  // editor (an insert renumbers ids, which `editingId` is keyed by).
  const freezeAndInsert = (
    index: number,
    side: "left" | "right",
    hex: string,
  ) => {
    const w = paletteRef.current?.getBoundingClientRect().width ?? 0;
    const widths: Record<string, number> = {};
    for (const c of palette) {
      const node = colRefs.current[c.dataId];
      if (node) widths[c.dataId] = node.getBoundingClientRect().width;
    }
    const pinnedCols =
      side === "right" ? palette.slice(index) : palette.slice(0, index + 1);
    const pinnedTotal = pinnedCols.reduce(
      (s, c) => s + (widths[c.dataId] ?? 0),
      0,
    );
    const fluidCount = palette.length + 1 - pinnedCols.length;
    const newColShare = fluidCount > 0 ? (w - pinnedTotal) / fluidCount : 0;
    if (w > 0 && (frozen != null || newColShare >= MIN_NEW_COLUMN_PX))
      setFrozen({ side, widths });
    else setFrozen(null);
    setEditingId(null);
    insertColor(side === "right" ? index : index + 1, hex);
  };

  // The flex shorthand for the column at index `i`: editing → EDITING_FLEX; mid-insert
  // → frozen-side columns keep their snapshot px, the rest go fluid; hover-expanded →
  // EXPAND_TARGET px; else → fluid.
  const flexFor = (c: ColorCardProps, i: number): string => {
    if (editingId === c.id) return EDITING_FLEX;
    if (frozen) {
      const hi = palette.findIndex((p) => p.dataId === hoveredId);
      const pinned = hi >= 0 && (frozen.side === "right" ? i >= hi : i <= hi);
      const w = frozen.widths[c.dataId];
      return pinned && w != null ? `0 0 ${w}px` : "1 1 0";
    }
    if (c.dataId === hoveredId && hoveredExpands)
      return `0 0 ${EXPAND_TARGET}px`;
    return "1 1 0";
  };

  // Tools / export / save-load. On desktop these go in the content row's
  // side-panel slot (sized + slid in/out by that slot — see the render); on
  // mobile they're overlay siblings (self-animating). Mutually exclusive
  // (openTools/openExport/openSaved), so at most one is non-null.
  const toolsPanel = showTools ? (
    <PosterToolsTray
      ink={ink}
      bg={bg}
      isMobile={isMobile}
      palette={palette}
      onClose={closeSidePanel}
      onApply={(hexes) => {
        replaceAll(hexes);
        closeSidePanel();
      }}
    />
  ) : null;
  const exportPanel = showExport ? (
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
      onClose={closeSidePanel}
    />
  ) : null;
  const settingsPanel = showSettings ? (
    <PosterSettingsDrawer
      ink={ink}
      bg={bg}
      isMobile={isMobile}
      theme={theme}
      onSetTheme={setTheme}
      tickerVisible={tickerVisible}
      onToggleTicker={toggleTicker}
      savedList={savedList}
      onSavePalette={handleSavePalette}
      onLoadPalette={(hexes) => {
        replaceAll(hexes);
        closeSidePanel();
      }}
      onDeletePalette={removeSaved}
      onClose={closeSidePanel}
    />
  ) : null;
  const sidePanelChild = toolsPanel ?? exportPanel ?? settingsPanel;

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
        compact={isMobile}
        onSettings={openSettings}
        onTools={openTools}
        onExport={openExport}
        onRandomize={randomizeUnlocked}
        onMenu={() => setShowMenu(true)}
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
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            ref={paletteRef}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              position: "relative",
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
                flexDecl={flexFor(c, i)}
                leftHex={palette[i - 1]?.hex}
                rightHex={palette[i + 1]?.hex}
                columnRef={(el) => {
                  if (el) colRefs.current[c.dataId] = el;
                }}
                onHoverChange={(h) => handleColumnHover(c.dataId, h)}
                onInsertLeft={(hex) => freezeAndInsert(i, "right", hex)}
                onInsertRight={(hex) => freezeAndInsert(i, "left", hex)}
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
          {sidePanelChild && (
            <div
              style={{
                flex: "0 0 50%",
                height: "100%",
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                borderLeft: `${POSTER.borderW}px solid ${ink}`,
                animation: panelClosing
                  ? "sidePanelOutRight .2s cubic-bezier(.4,0,.6,1) forwards"
                  : "sidePanelInRight .24s cubic-bezier(.2,.7,.3,1)",
              }}
              onAnimationEnd={() => {
                if (panelClosing) {
                  setShowTools(false);
                  setShowExport(false);
                  setShowSettings(false);
                  setPanelClosing(false);
                }
              }}
            >
              <style>{`@keyframes sidePanelInRight { from { transform: translateX(100%); } to { transform: translateX(0); } } @keyframes sidePanelOutRight { from { transform: translateX(0); } to { transform: translateX(100%); } }`}</style>
              {sidePanelChild}
            </div>
          )}
        </div>
      )}

      {!isMobile && (
        <PosterFooter
          palette={palette}
          ink={ink}
          onAbout={() => setShowAbout(true)}
        />
      )}

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
      {isMobile && toolsPanel}
      {isMobile && exportPanel}
      {isMobile && settingsPanel}
      {showMenu && (
        <PosterMobileMenu
          ink={ink}
          bg={bg}
          onClose={() => setShowMenu(false)}
          onRandomize={randomizeUnlocked}
          onTools={openTools}
          onExport={openExport}
          onSettings={openSettings}
          onAbout={() => setShowAbout(true)}
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
