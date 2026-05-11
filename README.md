# P4LETTE

A one-page color palette tool. Make some colors, edit / lock / reorder / shuffle them, name them, and copy them out through an export template you control. No accounts, no backend. Deployed at https://p4lette.app.

React + Vite + TypeScript SPA, one skin (`poster`).

## What it does

- **Edit** — click a column (a tile on mobile) for an inline editor: a hex / rgb / hsl / hsv / oklch text input, HUE / SAT / LUM sliders, and a row of quick hues.
- **Lock & shuffle** — lock the colors you want to keep; `SHUFFLE` re-rolls the rest. It isn't N independent randoms — it generates one coherent ramp (a continuous hue arc, light → dark) via [`rampensau`](https://github.com/meodai/rampensau), so the unlocked colors still read as a set.
- **Reorder** — drag columns (long-press then drag, on touch).
- **Name** — colors are named through the [`color.pizza`](https://color.pizza/) API ([@meodai](https://github.com/meodai)); pick which name list to use.
- **TOOLS** — derive a palette from a seed: harmony sets in OKLCH ([`pro-color-harmonies`](https://github.com/meodai/pro-color-harmonies)) or on the painter's wheel ([`rybitten`](https://meodai.github.io/RYBitten/)), and perceptual tone scales ([`dittotones`](https://www.npmjs.com/package/dittotones), plus OKLCH and HSV variants). Hit `USE` on a result to apply it.
- **Export** — write a template with `$...$` placeholders; it resolves at copy time. Save templates and palettes to `localStorage`; the live palette is also encoded in the URL hash, so any palette is a shareable link.

Color math is OKLCH-first via [`culori`](https://github.com/Evercoder/culori).

## Scripts

- `npm run dev` — Vite dev server.
- `npm run build` — `tsc --noEmit && vite build` → `dist/`.
- `npm run preview` — serve the production build locally.
- `npm test` — run the Vitest suite once. `npm run test:watch` for watch mode.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run lint` — ESLint.
- `npm run og` — regenerate the favicons + OG image into `public/`.

## Export templates

Placeholders are wrapped in `$...$` and use 1-based color ids.

- `$1$` — the full first color object.
- `$1.hex$`, `$1.name$`, `$1.rgb$`, `$1.hsl$`, `$1.hsv$`, `$1.oklch$` — a single property.
- `$[1,3].name$` — an array from selected ids.
- `$[all].hex$` — an array over the whole palette.

Invalid ids, selectors, or properties resolve to explicit `[ERROR: …]` text so the export panel stays usable.

## Notes

- Color names come from `https://api.color.pizza/v1/`. Each palette change triggers one batched request (`noduplicates=true`), so names are re-resolved for the whole palette in context (and can change as colors are added, removed, or edited). Failed lookups fall back to the previous name or the hex, per slot.
- Persistence: `localStorage` (`p4lette_*_v1` keys — export template, name list, color mode, saved palettes, saved templates, welcome-seen, ticker visibility) and the URL hash (`#p=<hex>-<hex>-…`, 6-digit hexes).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). There's a source-of-truth spec in [`SPEC/`](SPEC/), sliced per subsystem.
