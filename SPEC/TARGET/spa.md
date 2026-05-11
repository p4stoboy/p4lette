# SPEC · spa — the poster UI

`src/skins/poster/*` (all components), `src/hooks/*`, plus `src/App.tsx` / `src/index.tsx`. The app has exactly one skin; `PosterSkin` is the root component and owns all view state that isn't palette data (palette data lives in `state.md`'s context). Design tokens in `src/skins/poster/tokens.ts`.

## Verbal outline

### Tokens & shared bits

- `tokens.ts` — `POSTER = { bg:"#FFF8E7", bgDark:"#0E0B08", ink:"#0E0B08", inkDark:"#FFF8E7", accent:"#FF3D00", display:'"Anton",…', body:'"Space Grotesk",…', mono:'"JetBrains Mono",…', borderW:3 } as const`. `PosterSkin` picks `ink`/`bg` from the light/dark pair per `theme`; nearly every component takes `ink`/`bg` props.
- `Backdrop.tsx` — `Backdrop({children,onClose,align="center"|"right"|"bottom"})`: fixed `inset:0` scrim (`rgba(14,11,8,.5)`, `zIndex:100`, fade-in); clicking the scrim → `onClose` (children `stopPropagation`). `align` controls where the panel sits. `SmallBtn({ink,onClick,children,tall})`: bordered button, hover-inverts to `ink`/`POSTER.bg`; `tall` bumps size + `minHeight:44` for touch. `Backdrop` is used by `PosterAbout` / `PosterWelcome` (center), `PosterSavedDrawer` (right/bottom), `PosterNamingSheet` (bottom); `SmallBtn` by `PosterExportSheet`, `PosterSavedDrawer`, `PosterToolsTray`. (`PosterExportSheet`, `PosterMobileMenu`, `PosterToolsTray` are `position:fixed`/`absolute` directly, not `Backdrop`-wrapped.)

### `PosterSkin.tsx` — root component

- Reads from `usePalette()`: `palette, names, resolvedTemplate, addColor, deleteColor, updateColor, reorderColor, toggleLock, randomizeUnlocked, replaceAll, exportTemplate, setExportTemplate, nameList`. Reads `isMobile` from `useViewport()`.
- **Local state** (the entire view-state surface):
  - `theme` `"light"|"dark"` (default light) → derives `isDark`, `bg`, `ink`.
  - overlays (all booleans): `showAbout`, `showWelcome` (init `!readSeenWelcome()`), `showExport`, `showSaved`, `showTools`, `showNaming` (mobile only), `showMenu` (mobile nav).
  - `editingId: number|null` — which tile/column is in inline edit. `lastEditedId: number|null` — last-touched color id (for the `L` lock shortcut + re-marking on edit/update/lock).
  - `savedList: SavedPalette[]` (init `loadSaved()`), `templateList: SavedTemplate[]` (init `loadSavedTemplates()`).
  - `copyLabel` (`"COPY!"` → `"COPIED ✓"`/`"FAILED"` for 1.5 s).
  - `tickerVisible` (init `readTickerVisible()` — true unless `localStorage["p4lette_ticker_v1"] === "0"`); `toggleTicker` flips it and writes the key.
- **`closeAllOverlays`** (`useCallback`, wired to `onEsc`) — an **ordered cascade, one layer per call**: `showWelcome`→`dismissWelcome()`; else `showMenu`→false; else `showNaming`→false; else `showExport`→false; else `showTools`→false; else `showSaved`→false; else `showAbout`→false; else `editingId!==null`→`setEditingId(null)`.
- **`useGlobalShortcuts`** wired: `onShuffle: randomizeUnlocked`, `onLock: handleLockShortcut` (toggles `lastEditedId ?? palette[0]?.id`), `onExport: ()=>setShowExport(v=>!v)`, `onHarmony: ()=>setShowTools(v=>!v)` (the `h` key opens the TOOLS tray), `onAbout: ()=>setShowAbout(v=>!v)`, `onEsc: closeAllOverlays`.
- **Helpers** (`useCallback`): `onCopy` (clipboard ← `resolvedTemplate`, cycles `copyLabel`); `handleSavePalette` (`window.prompt("Name this palette", defaultPaletteName(now))` → prepend `{id:newSavedId(),name,hexes:palette.map(c=>c.hex),createdAt}` → `slice(0,SAVED_LIMIT)` → `persistSaved`); `removeSaved(id)`; `handleSaveTemplate` (`window.prompt` → prepend `{id:newSavedTemplateId(),name,body:exportTemplate,createdAt}` → `slice(0,SAVED_TEMPLATES_LIMIT)` → `persistSavedTemplates`); `removeTemplate(id)`; `dismissWelcome` (`setShowWelcome(false)` + `markWelcomeSeen()`).
- **Reorder**: desktop = HTML5 DnD — `dragFrom = useRef`; `onDragStart(i)`/`onDragOver(i)` (`preventDefault` + `reorderColor(dragFrom.current, i)` then update ref). Touch = `touchHandlers = useTouchDragReorder({ onReorder: reorderColor })`, spread onto every tile/column (which carry `data-column-index`).
- **Name fit**: `paletteRef = useRef`; `nameFontSize = useFitNameSize({ names, containerRef: paletteRef, columnCount: isMobile?2:palette.length, paddingX: isMobile?16:20, maxFontSize: isMobile?28:38, minFontSize: isMobile?12:14, fontFamily: POSTER.display, fontWeight:400, letterSpacing:"-0.02em" })`.
- **Render** (root flex column, `bg`/`ink`/`POSTER.body`, `overflow:hidden`):
  1. `<PosterNav ink bg isDark compact={isMobile} tickerVisible onTheme onAbout onSaved onTools onExport onRandomize onAdd onMenu onToggleTicker savedCount={savedList.length}/>`.
  2. `{!isMobile && tickerVisible && <PosterTicker ink palette nameList/>}`.
  3. Palette grid (`ref=paletteRef`) — **mobile**: scrollable 2-col CSS grid of `<PosterTile>` (key `c.dataId`) then `<PosterAddTile ink onAdd>` (local sub-component). **desktop**: flex row of `<PosterColumn>` (no add-tile). Shared per-swatch props: `color={c}, name={names[i]||"..."}, index={i}, editing={editingId===c.id}, nameFontSize, onEdit (sets editingId+lastEditedId), onCloseEdit, onUpdate (updateColor(c.id,hex)+lastEditedId), onDelete (deleteColor(c.id)+setEditingId(null)), onLock (toggleLock(c.id)+lastEditedId)`, + drag/pointer handlers; `PosterTile` also gets `ink`.
  4. `{!isMobile && <PosterFooter palette ink bg/>}`.
  5. Conditionally-mounted overlays — `PosterWelcome` (`ink bg isMobile onClose=dismissWelcome`), `PosterAbout` (`ink bg isMobile onClose`), `PosterSavedDrawer` (`ink bg isMobile list=savedList onClose onSave=handleSavePalette onLoad=(hexes)=>{replaceAll(hexes);setShowSaved(false)} onDelete=removeSaved`), `PosterToolsTray` (`ink bg isMobile palette onClose=()=>setShowTools(false) onApply=(hexes)=>{replaceAll(hexes);setShowTools(false)}`), `PosterExportSheet` (`ink bg isMobile tpl=exportTemplate setTpl=setExportTemplate resolved=resolvedTemplate copyLabel templates=templateList onCopy onReset=()=>setExportTemplate(DEFAULT_TEMPLATE) onSaveTemplate=handleSaveTemplate onLoadTemplate=(body)=>setExportTemplate(body) onDeleteTemplate=removeTemplate onClose`), `PosterMobileMenu` (`ink bg isDark savedCount nameList tickerVisible onClose onTheme onAdd onRandomize onSaved onTools onExport onAbout onNaming=()=>setShowNaming(true) onToggleTicker`), `PosterNamingSheet` (`ink bg onClose`).
- Local helpers: `readSeenWelcome` (`localStorage["p4lette_seen_welcome_v1"]==="1"`), `markWelcomeSeen`, `readTickerVisible`.

### Nav surfaces

- `PosterNav.tsx` — `compact===true` (mobile): just the `P4★LETTE` wordmark + a `≡` button → `onMenu`. **Desktop, left→right**: wordmark `P4★LETTE` · `{isDark?"☀ LIGHT":"☾ DARK"}` (`onTheme`) · `ABOUT` (`onAbout`) · `{tickerVisible?"▼":"▶"} TICKER` (`onToggleTicker`) · `<flex:1 spacer>` · `＋ ADD` (bold, `onAdd`) · `SHUFFLE` (`onRandomize`) · `TOOLS` (`onTools`) · `SAVE / LOAD [{savedCount}]` (`onSaved`) · `EXPORT` (`onExport`). The three left toggles share a fixed `width = LEFT_W (124)`; the five right actions share `width = RIGHT_W (178)` — so each cluster reads as a uniform block (`NavBtn` is `box-sizing:border-box`, `white-space:nowrap`, `overflow:hidden`, `text-overflow:ellipsis`). Local `NavBtn`: hover inverts bg/fg, `borderRight: borderW solid ink`.
- `PosterMobileMenu.tsx` — full-screen `role="dialog"` (`zIndex:60`). Header: wordmark + `×`(`onClose`). **Rows top→bottom** (mirrors the desktop left→right order), each fires its handler then `onClose` (local `fire()`): `{isDark?"LIGHT MODE":"DARK MODE"}` (`onTheme`) · `ABOUT` (`onAbout`) · `{tickerVisible?"▼":"▶"} TICKER` (`onToggleTicker`) · `NAMES · {nameList}` (`onNaming`) · `＋ ADD COLOR` (bold) · `SHUFFLE UNLOCKED` · `TOOLS` · `SAVE / LOAD [{savedCount}]` · `EXPORT`. Local `Row`: press-down inverts; rows are full-width.

### Swatch components

- `PosterColumn.tsx` — desktop swatch column. Reads `colorMode` from `usePalette()`. `data-column-index={index}`, `draggable={!editing}`. Faint `01`-padded number top-right; `LOCKED` badge top-left when `color.locked`; bottom = name (`POSTER.display`, `nameFontSize`) + `formatColor(color.hex, colorMode)` (`POSTER.mono`). Font color from `fontColorFor(color.hex)`. On hover (not editing): a column of actions `EDIT` / `LOCK`|`UNLOCK` / `REMOVE` (each `stopPropagation`). When `editing`: renders `<PosterEditTray color fontColor onUpdate onClose={onCloseEdit}/>`.
- `PosterTile.tsx` — mobile swatch tile. Same props **+ `ink`**. `aspectRatio: editing?"auto":"1/1"`, `gridColumn: editing?"1/-1":"auto"`, `minHeight: editing?540:undefined` — **the editing tile expands to the full row**. `onClick`→`onEdit()` when not editing. `01` index top-left; two `TileChip`s — lock toggle `◼`/`◻` (`active={color.locked}`, top-right) + delete `×` (bottom-right), both `stopPropagation`. Name + `formatColor` at bottom; `1px solid ink` right/bottom borders. When `editing`: `<PosterEditTray>`.
- `PosterEditTray.tsx` — inline color editor, shared by Column + Tile. Props `color, fontColor, onUpdate, onClose`. Reads `colorMode`. State `hex` (init `color.hex`), `input` (init `formatColor(color.hex, colorMode)`). **`useEffect(()=>{setInput(formatColor(hex,colorMode))},[colorMode,hex])` — line 31, the known `react-hooks/set-state-in-effect` lint error.** A second `useEffect` adds (after `setTimeout 0`) a `document` `mousedown` listener that calls `onClose()` on outside-click. `apply(h)=setHex(h)+onUpdate(h)`. Text field `onInput` runs `parseColor(v, colorMode)` and applies if non-null (keeps the raw text on invalid — doesn't revert). UI: `EDIT` header + `×`; labelled text input (label = `colorMode.toUpperCase()`); three `ChannelSlider`s `HUE`(0–360)/`SAT`(0–100)/`LUM`(0–100) over `hslToHex({...hexToHsl(hex),…})`; a `QUICK` 6-swatch row of fixed hues `[0,60,120,180,240,300]` at `s:70,l:55`. Local `ChannelSlider` (`accentColor: fontColor`).

### Tool / sheet overlays

- `PosterToolsTray.tsx` — `position:fixed inset:0` full-surface overlay (`zIndex:55`, fade-in `toolsIn`), header `TOOLS` (+ a hint line on desktop) + `×`. Two sections, **side by side on desktop (50/50, each scrolls independently); stacked on mobile (the tray scrolls through both)**:
  - **HARMONY** — `BASE COLOR` picker (swatch + hex `<input>` + a row of buttons to pick `base` from the current palette) + a 2-tab `OKLCH` / `RYB · ITTEN` toggle + rows `ANALOGOUS, COMPLEMENTARY, TRIADIC, TETRADIC, SPLIT-COMP, MONOCHROME, SHADES` — each `colors = wheel==="ryb" ? harmonyRyb(base,kind) : harmony(base,kind)` → swatch strip + label + `USE` (`SmallBtn` → `onApply(colors)`). Holds local `base` + `wheel`.
  - **TONES** — `SEED COLOR` picker (same shape, no wheel toggle) + the `TONE_METHODS` rows — each `scale = tones(base, m.id)` → 11-swatch strip + `m.label` + `m.caption` + `USE` (`onApply(scale)`). Holds local `base`.
  - Imports `harmony, harmonyRyb, HarmonyKind` from `../../functions/harmony`, `TONE_METHODS, tones` from `../../functions/tones`, `SmallBtn` from `./Backdrop`. (Replaced the former `PosterHarmonyDrawer` + `PosterTonesDrawer`.)
- `PosterSavedDrawer.tsx` — `<Backdrop align={isMobile?"bottom":"right"}>`, width `460`. Header `SAVE / LOAD` + `×`; sub-bar `{list.length} SAVED · LOCAL` + `♥ SAVE PALETTE` (`onSave`). Body: empty → big `NOTHING / HERE / YET.`; else per `s`: swatch strip + `s.name` + `new Date(s.createdAt).toLocaleDateString() · {n} colors` + `LOAD` (`onLoad(s.hexes)`) / `DEL` (`onDelete(s.id)`).
- `PosterExportSheet.tsx` — bottom sheet (`height: isMobile?"92%":"62%"`, slide-up, `boxShadow: 0 -10px 0 accent`, `zIndex:50`). Header `EXPORT` + (desktop) hint `$1.hex$ · $[1,3].name$ · $[all].hex$` + buttons `♥ SAVE`(`onSaveTemplate`) / `LOAD ▾`(toggles local `loadOpen`) / `RESET`(`onReset`) / accent `{copyLabel}`(`onCopy`) / `×`(`onClose`). `LOAD` dropdown: `SAVED TEMPLATES [{n}]` (or `NOTHING SAVED.`), each row a load-button (name + `formatDate(createdAt)`) + a `×` delete (`onDeleteTemplate(id)`). Body: `INPUT — EDIT ME` `<textarea value={tpl} onChange/>` | `OUTPUT — COPY ME` `<pre>{resolved}</pre>` (stacked on mobile).
- `PosterModePicker.tsx` — used **only by `PosterFooter`** (desktop). Reads `colorMode, setColorMode`. `MODES`: `hex/rgb/hsl/hsv/oklch`, each `{key,title,sample}`. Button `active.title · active.sample ▾` opens a `position:fixed` `role="listbox"` popover anchored via `getBoundingClientRect` (re-measured on resize/scroll in `useLayoutEffect`); outside-`mousedown`/`Escape` close; pick → `setColorMode(m.key)`.
- `PosterNamingPicker.tsx` — used **only by `PosterFooter`**. Reads `nameList, setNameList`; `useColorLists(open)` (lazy fetch). Button `color.pizza/{nameList} ▾`; popover (same pattern) shows `loading…`/`load failed`/list → `setNameList(l.key)`.
- `PosterNamingSheet.tsx` — used **only via `PosterMobileMenu`** (mobile). Reads `nameList, setNameList`; `useColorLists(true)`. `<Backdrop align="bottom">` bottom sheet: `NAMES` header + `color.pizza/{nameList}` + scrollable list → `setNameList(l.key)` then `onClose()`.
- `PosterTicker.tsx` — desktop-only marquee (rendered by `PosterSkin` when `tickerVisible`). Builds items: uppercased hex strip (joined `◇`, or `EMPTY PALETTE`), `{n} COLOR(S) LIVE`, `{lockedCount} LOCKED`, `NAMES · {nameList.toUpperCase()}`; joins `✺`; renders `COPIES=8` of the row in a flex strip with CSS `animation: p4l-marquee 60s linear infinite` (keyframe in `index.html`; respects `prefers-reduced-motion`); `aria-hidden`.
- `PosterFooter.tsx` — desktop-only bottom bar. Computes worst pairwise `contrast(...)` over all palette pairs → `grade` (`AAA≥7`, `AA≥4.5`, `AA Lg≥3`, else `FAIL`) + color. Stats: `LIVE` (`STREAMING`) · `CONTRAST` (`{ratio}:1 · {grade}`) · `MODE` (`<PosterModePicker>`) · `NAMING` (`<PosterNamingPicker>`) · spacer · `SHARE` (`<ShareButton>`: `navigator.share` if present, else copies `location.href`; label cycles). Imports `contrast` from `../../functions/contrast`.
- `PosterWelcome.tsx` — first-visit modal in `<Backdrop>` (center). `WELCOME, COLORIST.` + `MAKE A RACKET WITH COLOR.` + blurb + (desktop) `KEYMAP` (`SPACE`→shuffle, `TAP`→edit, `DRAG`→reorder, `L`→lock, `E`→export) + `LET'S GO →`(`onClose`).
- `PosterAbout.tsx` — about modal in `<Backdrop>`. `ABOUT` + `COLOR WITHOUT CEREMONY.` + blurb + GitHub link + `made by p4stoboy · pull requests welcome` + a grid of `AboutBlock`s: `HOW TO`, `WHY` (export-template pitch, mentions `$1.hex$`/`$[all].name$`), `UNDER THE HOOD` (React + Vite, OKLCH-first colour engine, URL hash + localStorage), `BUILT WITH` (credits `color.pizza`/@meodai), `COLOR ENGINE` (credits `culori`, `pro-color-harmonies`, `rybitten`, `dittotones`, `rampensau`, each linked), `SEE ALSO` (pickypalette, palettarium).

### Hooks (`src/hooks/*`)

- `use_viewport.ts` — `useViewport(): { isMobile, isLandscape }`. `MOBILE_MAX=768`. SSR-safe default `{isMobile:false,isLandscape:true}`; else `matchMedia("(max-width:768px)")` / `("(orientation:landscape)")`, subscribed to both `change` events. Used by `PosterSkin` (`isMobile` only; `isLandscape` has no consumer).
- `use_global_shortcuts.ts` — `useGlobalShortcuts(handlers)`. Optional `onShuffle/onLock/onExport/onHarmony/onAbout/onEsc`. Handlers kept in a `useRef` refreshed each render; one `keydown` listener (no deps). **Ignores keys when focus is in INPUT/TEXTAREA/contentEditable, except `Escape`.** ` `→`preventDefault`+`onShuffle`; `l`/`L`→`onLock`; `e`/`E`→`onExport`; `h`/`H`→`onHarmony` (wired to open the TOOLS tray); `?`→`onAbout`; `Escape`→`onEsc`. Used once by `PosterSkin`. (The handler is still named `onHarmony` — it's the `h`-key binding.)
- `use_touch_drag_reorder.ts` — `useTouchDragReorder({onReorder, longPressMs=350}) → { onPointerDown:(i)=>(e), onPointerMove, onPointerUp, onPointerCancel(=up) }`. Only `pointerType "touch"|"pen"`. `onPointerDown` starts the long-press timer; on fire records `from`/`pointerId` + `setPointerCapture`. `onPointerMove`: any move before long-press cancels the timer; after, `preventDefault` + `document.elementFromPoint(...).closest("[data-column-index]")` and `onReorder(from, idx)` when it crosses into a new column (chains by updating `from`). `onPointerUp` clears + `releasePointerCapture` + resets. Used once by `PosterSkin`, spread onto Column/Tile.
- `use_fit_name_size.ts` — `useFitNameSize(opts) → number` (px). `opts: { names, containerRef, columnCount, paddingX, maxFontSize, minFontSize, fontFamily, fontWeight, letterSpacing, uppercase?=true }`. `useLayoutEffect` (deps = `names.join("")` + the scalars + `containerRef`): finds the longest _word_ across names, measures its width at `100px` via a hidden `<span>` appended to `document.body`, `ideal = (el.clientWidth/cols - paddingX*2) / widthAt100 * 100`, clamps `[min,max]` (`Math.floor`); re-runs on a container `ResizeObserver`; bails to `maxFontSize` if no word, returns early if widths ≤ 0. **Touches the DOM directly.** Used once by `PosterSkin`.
- `use_color_lists.ts` — `useColorLists(enabled) → { lists, loading, error }`. Effect (deps `[enabled, lists.length]`): when `enabled && lists.length===0`, `loadColorLists()` (`../functions/color_lists`, module-memoised) → set `lists` / `failed`; `alive` guard. `loading = enabled && lists.length===0 && !failed`. Used by `PosterNamingPicker` (lazy) and `PosterNamingSheet` (eager).

## JSON

```json
{
  "root": "src/skins/poster/PosterSkin.tsx",
  "tokens": "src/skins/poster/tokens.ts — POSTER {bg,bgDark,ink,inkDark,accent,display,body,mono,borderW:3}",
  "posterSkin": {
    "fromContext": [
      "palette",
      "names",
      "resolvedTemplate",
      "addColor",
      "deleteColor",
      "updateColor",
      "reorderColor",
      "toggleLock",
      "randomizeUnlocked",
      "replaceAll",
      "exportTemplate",
      "setExportTemplate",
      "nameList"
    ],
    "fromHooks": {
      "useViewport": "isMobile",
      "useFitNameSize": "nameFontSize",
      "useTouchDragReorder": "touchHandlers",
      "useGlobalShortcuts": "key bindings"
    },
    "localState": [
      "theme",
      "showAbout",
      "showWelcome",
      "showExport",
      "showSaved",
      "showTools",
      "showNaming",
      "showMenu",
      "editingId",
      "lastEditedId",
      "savedList",
      "templateList",
      "copyLabel",
      "tickerVisible"
    ],
    "closeAllOverlays": [
      "welcome→dismissWelcome",
      "menu",
      "naming",
      "export",
      "tools",
      "saved",
      "about",
      "editingId→null"
    ],
    "shortcuts": {
      "space": "randomizeUnlocked",
      "l": "toggle lastEditedId??palette[0]",
      "e": "toggle showExport",
      "h": "toggle showTools",
      "?": "toggle showAbout",
      "esc": "closeAllOverlays"
    },
    "renderOrder": [
      "PosterNav",
      "(desktop&tickerVisible) PosterTicker",
      "palette grid (PosterTile×n+PosterAddTile mobile | PosterColumn×n desktop)",
      "(desktop) PosterFooter",
      "overlays: Welcome/About/SavedDrawer/ToolsTray/ExportSheet/MobileMenu/NamingSheet"
    ],
    "localStorageOwned": {
      "p4lette_seen_welcome_v1": "readSeenWelcome/markWelcomeSeen",
      "p4lette_ticker_v1": "readTickerVisible/toggleTicker"
    }
  },
  "navItems": {
    "PosterNav.desktop": [
      "P4★LETTE",
      "☀/☾ LIGHT|DARK→onTheme (LEFT_W=124)",
      "ABOUT→onAbout (LEFT_W)",
      "▼/▶ TICKER→onToggleTicker (LEFT_W)",
      "<spacer>",
      "＋ ADD→onAdd (RIGHT_W=178, bold)",
      "SHUFFLE→onRandomize (RIGHT_W)",
      "TOOLS→onTools (RIGHT_W)",
      "SAVE / LOAD [n]→onSaved (RIGHT_W)",
      "EXPORT→onExport (RIGHT_W)"
    ],
    "PosterNav.compact": ["P4★LETTE", "≡→onMenu"],
    "PosterMobileMenu.rows": [
      "LIGHT|DARK MODE→onTheme",
      "ABOUT→onAbout",
      "▼/▶ TICKER→onToggleTicker",
      "NAMES · {list}→onNaming",
      "＋ ADD COLOR (bold)",
      "SHUFFLE UNLOCKED→onRandomize",
      "TOOLS→onTools",
      "SAVE / LOAD [n]→onSaved",
      "EXPORT→onExport"
    ]
  },
  "components": {
    "PosterColumn": "desktop swatch; data-column-index; hover actions EDIT/LOCK/REMOVE; PosterEditTray when editing",
    "PosterTile": "mobile swatch; editing→full-row expand (gridColumn 1/-1, minHeight 540); lock+delete chips; PosterEditTray when editing",
    "PosterEditTray": "shared inline editor; text input(parseColor) + HUE/SAT/LUM sliders + QUICK 6 hues; outside-click closes; LINE 31 = known lint error",
    "PosterToolsTray": "full-surface overlay (fixed inset:0, zIndex 55); HARMONY section (base picker + OKLCH|RYB·ITTEN toggle + 7 harmony rows) and TONES section (seed picker + TONE_METHODS rows) — side-by-side on desktop / stacked on mobile; USE→onApply; replaced PosterHarmonyDrawer + PosterTonesDrawer",
    "PosterSavedDrawer": "right/bottom drawer; ♥ SAVE PALETTE; entries name+date+swatches → LOAD/DEL",
    "PosterExportSheet": "bottom sheet; ♥ SAVE / LOAD▾ / RESET / COPY; INPUT textarea | OUTPUT pre(resolvedTemplate)",
    "PosterModePicker": "footer-only; colorMode listbox popover",
    "PosterNamingPicker": "footer-only; nameList listbox popover (useColorLists lazy)",
    "PosterNamingSheet": "mobile-only; nameList bottom sheet (useColorLists eager)",
    "PosterTicker": "desktop marquee; aria-hidden; CSS p4l-marquee 60s",
    "PosterFooter": "desktop bar; worst-pair contrast grade + ModePicker + NamingPicker + ShareButton",
    "PosterWelcome": "first-visit modal + KEYMAP",
    "PosterAbout": "about modal; AboutBlocks HOW TO/WHY/UNDER THE HOOD/BUILT WITH(color.pizza)/COLOR ENGINE(culori,pro-color-harmonies,rybitten,dittotones,rampensau)/SEE ALSO",
    "Backdrop / SmallBtn": "shared scrim (center/right/bottom) + bordered hover-invert button"
  },
  "hooks": {
    "use_viewport": "{isMobile,isLandscape}; matchMedia 768px + orientation",
    "use_global_shortcuts": "ref'd handlers; one keydown; skips inputs except Escape; space/l/e/h(→TOOLS)/?/Escape",
    "use_touch_drag_reorder": "long-press(350ms) then pointermove→elementFromPoint→[data-column-index]→onReorder; chains",
    "use_fit_name_size": "measures longest word via hidden span; (colW-2pad)/w100*100 clamped [min,max]; ResizeObserver",
    "use_color_lists": "{lists,loading,error}; loadColorLists() once when enabled"
  }
}
```

## Control-flow diagram

```mermaid
flowchart TD
  ctx["usePalette() — state.md"] --> skin["PosterSkin (root view state)"]
  vp["useViewport"] --> skin
  sc["useGlobalShortcuts"] --> skin
  skin --> nav["PosterNav / PosterMobileMenu"]
  skin --> grid["PosterColumn ×n  /  PosterTile ×n + PosterAddTile"]
  grid --> tray["PosterEditTray (when editing)"]
  skin --> foot["PosterFooter → PosterModePicker · PosterNamingPicker · ShareButton"]
  skin --> tick["PosterTicker (desktop, tickerVisible)"]
  skin --> ovl["overlays: Welcome · About · SavedDrawer · ToolsTray · ExportSheet · MobileMenu · NamingSheet"]
  nav -->|on*| skin
  grid -->|onEdit/onUpdate/onDelete/onLock + drag/pointer| skin
  tray -->|onUpdate(hex) → updateColor| ctx
  ovl -->|replaceAll / setExportTemplate / save·load handlers| skin
  skin -->|dispatch via callbacks| ctx
  ovl -->|harmony·tones·resolveTemplate| fns["src/functions — color.md"]
  foot --> fns
  draglib["useTouchDragReorder"] -.->|spread onto| grid
  nf["useFitNameSize"] -.->|nameFontSize| grid
  cl["useColorLists"] --> foot
  cl --> ovl
  skin <-->|p4lette_seen_welcome_v1 · p4lette_ticker_v1| ls[("localStorage")]
```
