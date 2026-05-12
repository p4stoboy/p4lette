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
  - `tickerVisible` (init `readTickerVisible()` — true **only if** `localStorage["p4lette_ticker_v1"] === "1"`, i.e. off by default); `toggleTicker` flips it and writes `"1"`/`"0"`.
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
- Local helpers: `readSeenWelcome` (`localStorage["p4lette_seen_welcome_v1"]==="1"`), `markWelcomeSeen`, `readTickerVisible` (`localStorage["p4lette_ticker_v1"]==="1"` — off by default).

### Nav surfaces

- `PosterNav.tsx` — `compact===true` (mobile): just the `P4★LETTE` wordmark + a `≡` button → `onMenu`. **Desktop, left→right**: wordmark `P4★LETTE` · `{isDark?"☀ LIGHT":"☾ DARK"}` (`onTheme`) · `ABOUT` (`onAbout`) · `{tickerVisible?"▼":"▶"} TICKER` (`onToggleTicker`) · `<flex:1 spacer, minWidth 40>` · `＋ ADD COLOR` (the emphasised primary action — `bold large borderLeft`: the biggest button, and the only one with a `borderLeft` — the sole line at the right-cluster boundary; `onAdd`) · `SHUFFLE` (`onRandomize`) · `TOOLS` (`onTools`) · `SAVE / LOAD [{savedCount}]` (`onSaved`) · `EXPORT` (`onExport`). The three left toggles share a fixed `width = LEFT_W (124)`; the five right actions share `width = RIGHT_W (172)` — so each cluster reads as a uniform block (`NavBtn` is `box-sizing:border-box`, `white-space:nowrap`, `overflow:hidden`, `text-overflow:ellipsis`; props `large`→`fontSize:16`, `borderLeft`→adds a left border = the cluster-start divider on `＋ ADD COLOR`). The `<flex:1>` spacer has `minWidth:40` so a narrow viewport doesn't collapse the gap into a doubled-up border. The bar is kept compact — wordmark at `fontSize:40` (≈58 px tall). Local `NavBtn`: hover inverts bg/fg, `borderRight: borderW solid ink`.
- `PosterMobileMenu.tsx` — full-screen `role="dialog"` (`zIndex:60`). Header: wordmark + `×`(`onClose`). **Rows top→bottom** (mirrors the desktop left→right order), each fires its handler then `onClose` (local `fire()`): `{isDark?"LIGHT MODE":"DARK MODE"}` (`onTheme`) · `ABOUT` (`onAbout`) · `{tickerVisible?"▼":"▶"} TICKER` (`onToggleTicker`) · `NAMES · {nameList}` (`onNaming`) · `＋ ADD COLOR` (bold) · `SHUFFLE UNLOCKED` · `TOOLS` · `SAVE / LOAD [{savedCount}]` · `EXPORT`. Local `Row`: press-down inverts; rows are full-width.

### Swatch components

- `PosterColumn.tsx` — desktop swatch column. Reads `colorMode` from `usePalette()`. `data-column-index={index}`, `draggable={!editing}`. Faint `01`-padded number top-right; `LOCKED` badge top-left when `color.locked`; bottom = name (`POSTER.display`, `nameFontSize`) + `formatColor(color.hex, colorMode)` (`POSTER.mono`). Font color from `fontColorFor(color.hex)`. On hover (not editing): a column of actions `EDIT` / `LOCK`|`UNLOCK` / `REMOVE` (each `stopPropagation`). When `editing`: renders `<PosterEditTray color fontColor onUpdate onClose={onCloseEdit}/>`.
- `PosterTile.tsx` — mobile swatch tile. Same props **+ `ink`**. `aspectRatio: editing?"auto":"1/1"`, `gridColumn: editing?"1/-1":"auto"`, `minHeight: editing?540:undefined` — **the editing tile expands to the full row**. `onClick`→`onEdit()` when not editing. `01` index top-left; two `TileChip`s — lock toggle `◼`/`◻` (`active={color.locked}`, top-right) + delete `×` (bottom-right), both `stopPropagation`. Name + `formatColor` at bottom; `1px solid ink` right/bottom borders. When `editing`: `<PosterEditTray>`.
- `PosterEditTray.tsx` — inline color editor, shared by Column + Tile. Props `color, fontColor, onUpdate, onClose`. Reads `colorMode`. State `hex` (init `color.hex`), `input` (init `formatColor(color.hex, colorMode)`). **`useEffect(()=>{setInput(formatColor(hex,colorMode))},[colorMode,hex])` — the known `react-hooks/set-state-in-effect` lint error (≈line 30).** A second `useEffect` adds (after `setTimeout 0`) a `document` `mousedown` listener that calls `onClose()` on outside-click. `apply(h)=setHex(h)+onUpdate(h)`. Text field `onInput` runs `parseColor(v, colorMode)` and applies if non-null (keeps the raw text on invalid — doesn't revert). UI: `EDIT` header + `×`; labelled text input (label = `colorMode.toUpperCase()`, format follows the MODE picker); three `ChannelSlider`s `HUE`/`SAT`/`LUM` working in **Okhsl** (`ok = hexToOkhsl(hex)`; HUE 0–360 = `ok.h`, SAT/LUM 0–100 = `ok.s*100`/`ok.l*100`; `onChange` → `okhslToHex({...ok, channel: v(/100)})`) — perceptually even, independent of the display MODE; a `QUICK` 6-swatch row of fixed Okhsl hues `[0,60,120,180,240,300]` at `s:0.82,l:0.62`. Local `ChannelSlider` (`accentColor: fontColor`).

### Tool / sheet overlays

- `PosterToolsTray.tsx` — `position:fixed inset:0` full-surface overlay (`zIndex:55`, fade-in `toolsIn`), header `TOOLS` (+ a hint line on desktop: `pick a tool · hit USE to apply a result`) + `×`. Below the header a **2-row pill-tab strip** (one `Toggle` per `TRAY_SECTIONS` entry — `src/skins/poster/tools/index.ts`, `{ key, label, Body }[]`) selects the active section; under it the active section's `subHeaderStyle` header (its registry `label`); under that the seven bodies — **all mounted, only the active one shown** (`display:none` on the rest, so each body's local state survives a tab switch). Each `Body` a file under `src/skins/poster/tools/`; shared building blocks `BasePicker`/`SwatchRow`/`Toggle`/`RangeRow` in `tools/shared.tsx`, the layout-style helpers `subHeaderStyle`/`rowsStyle` + `BodyProps` in `tools/styles.ts`. The sections:
  - **HARMONY** — `BASE COLOR` picker (swatch + hex `<input>` + a row of buttons to pick `base` from the current palette) + a 2-row control: row 1 is the `OKLCH` / `HSV` space toggle; row 2 is the variant picker — when `oklch`, the `HARMONY_STYLES` (`DEFAULT/SQUARE/TRIANGLE/CIRCLE/DIAMOND`); when `hsv`, none (the HSV harmonies have no variant). Then the rows — for `oklch` the 7 `HARMONIES` (`ANALOGOUS, COMPLEMENTARY, TRIADIC, TETRADIC, SPLIT-COMP, MONOCHROME, SHADES`) → `colors = harmony(base, kind, style)`; for `hsv` the `HARMONY_HSV_KINDS` (`COMPLEMENTARY ANALOGOUS TRIADIC TETRADIC SPLIT-COMP PENTADIC HEXADIC COMPOUND DBL-COMP`) → `colors = harmonyHsv(base, kindKey)` — each row a swatch strip + label + `USE` (`SmallBtn` → `onApply(colors)`). Holds local `base`, `space`, `style`. (In OKLCH the `style` toggle now affects MONOCHROME/SHADES too — via pro-color-harmonies `tintsShades`.) The painter's-pigment use of rybitten lives in the PIGMENT tool, not here.
  - **TONES** — `SEED COLOR` picker (same shape, no controls) + the `TONE_METHODS` rows (`DITTOTONES / OKLCH RAMP / HSV CURVE / GENERATIVE`) — each `scale = tones(base, m.id)` → 11-swatch strip + `m.label` + caption (`m.caption`; for the `ditto` row, suffixed `· matched {dittoMatch(base).shade} ({.method})` — e.g. `· matched amber-700 (blend)`) + `USE` (`onApply(scale)`). Holds local `base`; `match = dittoMatch(base)` computed once per render.
  - **FIXERS** — no base/seed picker; operates on the **live palette** (`palette.map(c=>c.hex)`). Rows: `PROTANOPIA` / `DEUTERANOPIA` / `TRITANOPIA` — each `simulateCvd(hexes, type)` (a non-destructive preview of how the palette reads with that colour-vision deficiency), `USE`→`onApply(sim)`; then `IN-GAMUT sRGB` — `snapToGamut(hexes)`, caption switches to "already displayable" when nothing changed, `USE`→`onApply(snapped)`.
  - **PIGMENT** — no base/seed picker; operates on the **live palette**. A `PROFILE` picker = `PIGMENT_CUBES` rendered as two `Toggle` rows (`ITTEN GOETHE RUNGE CHEVREUL MUNSELL` / `HARRIS BOUTET CMY RGB`), `itten` default; a `{author · year}` caption below it. Rows: `FILTER` — `pigmentFilter(hexes, cube)` (each swatch re-rendered through the cube — the print-like / painterly version; the cube is a colour filter, not just a hue source); `WHEEL` — `pigmentWheel(cube, isMobile?7:11)` (the cube's own colour wheel); `THIS CUBE` — `cubeCorners(cube)` (the 8 corner colours). Each row `USE`→`onApply(...)`. Holds local `cube`.
  - **MIX** — two stacked `FROM COLOR` / `TO COLOR` pickers (same shape, over the live palette) + a 3-row control: `MIX_STEPS` (`3 5 7 9 11`) / `MIX_SPACES` (`OKLCH LAB HSL`) / `MIX_CURVES` (`EVEN | EASE FROM | EASE TO`). One row: `mixSteps(from, to, n, space, curve)` → `{n} STEPS` + caption `{from} → {to} in {space}` + `USE`→`onApply`. Holds local `from`, `to`, `n`, `space`, `curve`.
  - **EFFECTS** — no seed; reads the **live palette**. A `BLEND OVER` picker (same shape) whose `children` are a 2-row `BLEND_MODES` picker (`MULTIPLY SCREEN OVERLAY SOFT-LIGHT` / `HARD-LIGHT DARKEN LIGHTEN DIFFERENCE`). Rows: first `BLEND · {mode}` → `blendWith(hexes, over, mode)` (caption `palette × {over}`), then one `SwatchRow` per `EFFECTS` entry (`GRAYSCALE SEPIA INVERT SATURATE+ DESATURATE CONTRAST+ HUE +30 HUE -30` → `applyEffect(hexes, key)`). Each `USE`→`onApply`. Holds local `over`, `mode`.
  - **SHUFFLE SETTINGS** (registry key `shuffle`; the body file stays `tools/GenerateBody.tsx`) — reads `genStrategy`/`genParams`/`setGenConfig` from `usePalette()` (the only body that does). A caption under the `STRATEGY` label — "sets how the SHUFFLE button builds a fresh palette". The `STRATEGY` picker (`GEN_STRATEGIES` `Toggle` row — `DEFAULT / RAMPENSAU SWEEP / POLINE ANCHORS / PLAIN RANDOM`); when `rampensau`, six `RangeRow` sliders (`SAT LO/HI`, `LIGHT LO/HI`, `HUE SPAN`, `CURVE ACCENT`) configured from `RAMP_PARAM_META`. A `PREVIEW` `SwatchRow` of `generatePalette(palette.length, strategy, Math.random, params)` + a `REGEN` `SmallBtn` (re-rolls the preview) + `USE` — which `onApply(preview)` **and** `setGenConfig({strategy, params: rampensau ? params : null})` so the nav SHUFFLE button (and the `Space` shortcut) use the chosen strategy/params afterward. Holds local `strategy`, `params`, `preview` (re-rolled on strategy switch / a slider move / REGEN — never in an effect).
  - `Toggle` (the tab button) is `nowrap`/`ellipsis` so the longer style/cube/profile/harmony/mode/strategy labels don't break a row on narrow viewports. `RangeRow` = a labelled `<input type="range">` (`accentColor: ink`) with `min/max/step` from a meta object.
  - Each `*Body` pulls its own colour-engine deps from `../../../functions/*` (the section name says which: HARMONY → `harmony`, TONES → `tones`, FIXERS/EFFECTS → `color_filters`, PIGMENT → `pigment`, MIX → `color_mix`, GENERATE → `generate_palette`); `GenerateBody` also `usePalette()`. `PosterToolsTray.tsx` itself imports just `TRAY_SECTIONS`/`sectionStyle`/`subHeaderStyle` from `./tools` and `POSTER` from `./tokens`.
- `PosterSavedDrawer.tsx` — `<Backdrop align={isMobile?"bottom":"right"}>`, width `460`. Header `SAVE / LOAD` + `×`; sub-bar `{list.length} SAVED · LOCAL` + `♥ SAVE PALETTE` (`onSave`). Body: empty → big `NOTHING / HERE / YET.`; else per `s`: swatch strip + `s.name` + `new Date(s.createdAt).toLocaleDateString() · {n} colors` + `LOAD` (`onLoad(s.hexes)`) / `DEL` (`onDelete(s.id)`).
- `PosterExportSheet.tsx` — bottom sheet (`height: isMobile?"92%":"62%"`, slide-up, `boxShadow: 0 -10px 0 accent`, `zIndex:50`). Header `EXPORT` + (desktop) hint `$1.hex$ · $[1,3].name$ · $[all].hex$` + buttons `♥ SAVE`(`onSaveTemplate`) / `LOAD ▾`(toggles local `loadOpen`) / `PRESETS ▾`(toggles local `presetsOpen`; the two dropdowns close each other) / `RESET`(`onReset`) / accent `{copyLabel}`(`onCopy`) / `×`(`onClose`). `LOAD` dropdown: `SAVED TEMPLATES [{n}]` (or `NOTHING SAVED.`), each row a load-button (name + `formatDate(createdAt)`) + a `×` delete (`onDeleteTemplate(id)`). `PRESETS` dropdown: `PRESETS [{n}]` → a button per `EXPORT_PRESETS` entry (imported from `../../functions/resolve_export_template`) — `p.label` → `onLoadTemplate(p.body)`. Body: `INPUT — EDIT ME` `<textarea value={tpl} onChange/>` | `OUTPUT — COPY ME` `<pre>{resolved}</pre>` (stacked on mobile).
- `PosterModePicker.tsx` — used **only by `PosterFooter`** (desktop). Reads `colorMode, setColorMode`. `MODES`: `hex/rgb/hsl/hsv/oklch`, each `{key,title,sample}`. Button `active.title · active.sample ▾` opens a `position:fixed` `role="listbox"` popover anchored via `getBoundingClientRect` (re-measured on resize/scroll in `useLayoutEffect`); outside-`mousedown`/`Escape` close; pick → `setColorMode(m.key)`.
- `PosterNamingPicker.tsx` — used **only by `PosterFooter`**. Reads `nameList, setNameList`; `useColorLists(open)` (lazy fetch). Button `color.pizza/{nameList} ▾`; popover (same pattern) shows `loading…`/`load failed`/list → `setNameList(l.key)`.
- `PosterNamingSheet.tsx` — used **only via `PosterMobileMenu`** (mobile). Reads `nameList, setNameList`; `useColorLists(true)`. `<Backdrop align="bottom">` bottom sheet: `NAMES` header + `color.pizza/{nameList}` + scrollable list → `setNameList(l.key)` then `onClose()`.
- `PosterTicker.tsx` — desktop-only marquee (rendered by `PosterSkin` when `tickerVisible`). Builds items: uppercased hex strip (joined `◇`, or `EMPTY PALETTE`), `{n} COLOR(S) LIVE`, `{lockedCount} LOCKED`, `NAMES · {nameList.toUpperCase()}`; joins `✺`; renders `COPIES=8` of the row in a flex strip with CSS `animation: p4l-marquee 60s linear infinite` (keyframe in `index.html`; respects `prefers-reduced-motion`); `aria-hidden`.
- `PosterFooter.tsx` — desktop-only bottom bar. Computes worst pairwise `contrast(...)` over all palette pairs → `grade` (`AAA≥7`, `AA≥4.5`, `AA Lg≥3`, else `FAIL`) + color. Stats: `LIVE` (`STREAMING`) · `CONTRAST` (`{ratio}:1 · {grade}`) · `MODE` (`<PosterModePicker>`) · `NAMING` (`<PosterNamingPicker>`) · spacer · `SHARE` (`<ShareButton>`: `navigator.share` if present, else copies `location.href`; label cycles). Imports `contrast` from `../../functions/contrast`.
- `PosterWelcome.tsx` — first-visit modal in `<Backdrop>` (center). `WELCOME, COLORIST.` + `MAKE A RACKET WITH COLOR.` + blurb + (desktop) `KEYMAP` (`SPACE`→shuffle, `TAP`→edit, `DRAG`→reorder, `L`→lock, `E`→export) + `LET'S GO →`(`onClose`).
- `PosterAbout.tsx` — about modal in `<Backdrop>`. `ABOUT` + `COLOR WITHOUT CEREMONY.` + blurb + GitHub link + `made by p4stoboy · pull requests welcome` + a 2-col grid of `AboutBlock`s (`AboutBlock({ink,title,wide?,children})` — `wide` → `gridColumn:"1 / -1"`): `HOW TO`, `WHY` (export-template pitch, mentions `$1.hex$`/`$[all].name$`), `UNDER THE HOOD` (React + Vite, OKLCH-first colour engine, URL hash + localStorage), `SEE ALSO` (pickypalette, palettarium — by @meodai), and a **`CREDITS`** block (`wide`, spans both columns) = the tool → library → author map: `culori` by Evercoder is the OKLCH engine + the `FIXERS`/`EFFECTS`/`MIX` transforms; the rest are @meodai's — `pro-color-harmonies` (HARMONY styles + tints/shades), `rybitten` (the PIGMENT pigment wheels), `dittotones` + `fettepalette` (the two TONES ramps), `rampensau` (SHUFFLE/generation + HSV harmonies + the GENERATIVE tone), `poline` (the POLINE ANCHORS strategy), `color.pizza` (colour names — "the naming layer exists because theirs does") — each linked.

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
      "<spacer minWidth:40>",
      "＋ ADD COLOR→onAdd (RIGHT_W=172, bold+large+borderLeft — emphasised primary action)",
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
    "PosterEditTray": "shared inline editor; text input(parseColor, MODE-formatted) + HUE/SAT/LUM sliders in Okhsl + QUICK 6 Okhsl hues; outside-click closes; the [colorMode,hex] setInput effect = the known react-hooks/set-state-in-effect lint error",
    "PosterToolsTray": "full-surface overlay (fixed inset:0, zIndex 55); body = a 2-row pill-tab strip (one Toggle per TRAY_SECTIONS entry — src/skins/poster/tools/index.ts, {key,label,Body}) selecting one section, the rest stay mounted (display:none, state preserved) — HARMONY (base picker + OKLCH|HSV space toggle + a HARMONY_STYLES variant picker for oklch (none for hsv) + harmony rows: oklch → 7 HARMONIES via harmony(base,kind,style) [style affects mono/shades via tintsShades]; hsv → HARMONY_HSV_KINDS via harmonyHsv(base,kind) incl. pentadic/hexadic/compound/dbl-comp), TONES (seed picker + 4 TONE_METHODS rows ditto/oklch/hsv/gen; ditto row caption suffixed with dittoMatch(base) → 'matched <ramp>-<step> (<method>)'), FIXERS (no picker; CVD prot/deuter/trit previews of the live palette + an IN-GAMUT sRGB snap via simulateCvd/snapToGamut), PIGMENT (no picker; a PROFILE picker over PIGMENT_CUBES + FILTER=pigmentFilter(palette,cube) — the print-like re-render — / WHEEL=pigmentWheel(cube) / THIS CUBE=cubeCorners(cube)), MIX (two FROM/TO pickers + steps/space/curve toggles + mixSteps(from,to,n,space,curve)), EFFECTS (no seed; BLEND OVER picker + BLEND_MODES toggle + a BLEND row via blendWith first, then 8 EFFECTS preset rows via applyEffect), SHUFFLE SETTINGS (registry key shuffle; reads genStrategy/genParams/setGenConfig from usePalette(); a "sets how the SHUFFLE button builds a fresh palette" caption; STRATEGY toggle GEN_STRATEGIES [DEFAULT first] + rampensau RangeRow sliders from RAMP_PARAM_META + a PREVIEW row of generatePalette(...) with REGEN + USE → onApply(preview) AND setGenConfig so the nav SHUFFLE uses it); each USE→onApply the transformed palette; Toggle is nowrap/ellipsis; each Body a file under tools/, BasePicker/SwatchRow/Toggle/RangeRow in tools/shared.tsx, subHeaderStyle/rowsStyle/BodyProps in tools/styles.ts",
    "PosterSavedDrawer": "right/bottom drawer; ♥ SAVE PALETTE; entries name+date+swatches → LOAD/DEL",
    "PosterExportSheet": "bottom sheet; ♥ SAVE / LOAD▾ (saved templates) / PRESETS▾ (built-in EXPORT_PRESETS — picks p.body via onLoadTemplate; mutually exclusive with LOAD) / RESET / COPY; INPUT textarea | OUTPUT pre(resolvedTemplate)",
    "PosterModePicker": "footer-only; colorMode listbox popover",
    "PosterNamingPicker": "footer-only; nameList listbox popover (useColorLists lazy)",
    "PosterNamingSheet": "mobile-only; nameList bottom sheet (useColorLists eager)",
    "PosterTicker": "desktop marquee; aria-hidden; CSS p4l-marquee 60s",
    "PosterFooter": "desktop bar; worst-pair contrast grade + ModePicker + NamingPicker + ShareButton",
    "PosterWelcome": "first-visit modal + KEYMAP",
    "PosterAbout": "about modal; 2-col grid of AboutBlocks ({ink,title,wide?,children}, wide=gridColumn 1/-1): HOW TO / WHY / UNDER THE HOOD / SEE ALSO / CREDITS(wide) — the tool→library→author map: culori/Evercoder = OKLCH engine + FIXERS/EFFECTS/MIX transforms; @meodai's: pro-color-harmonies (HARMONY styles+tints/shades), rybitten (PIGMENT wheels), dittotones+fettepalette (TONES ramps), rampensau (SHUFFLE/gen+HSV harmonies+GENERATIVE tone), poline (POLINE ANCHORS), color.pizza (names) — all linked",
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
