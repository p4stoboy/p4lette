# Contributing

Thanks for poking at P4LETTE. It's a small React + Vite + TypeScript SPA — see [README.md](README.md) for what it does and the scripts.

## Setup

```sh
npm install
npm run dev
```

## Branches & commits

- Branch off `dev`. Name branches `<type>/<slug>` — `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`, `ci/`, `perf/`.
- [Conventional commits](https://www.conventionalcommits.org/): `type(scope): summary` — imperative, lowercase, no trailing period, ≤ 72 chars. Explain _why_ in the body when it isn't obvious.
- **Open PRs against `dev`**, not the default branch. No auto-merge.

## Before you push

- `npm run build` (`tsc --noEmit && vite build`) must pass.
- `npm test` (Vitest) must be green.
- `npm run lint` should be clean **except** one known pre-existing error: `react-hooks/set-state-in-effect` at `src/skins/poster/PosterEditTray.tsx:31`. `eslint .` therefore exits non-zero — that one error is expected until that file is fixed. Don't add new lint errors.
- UI changes have no automated coverage (there's no component-test harness for the poster skin) — verify them by hand in a browser.

## Tests

- Tests are **colocated next to source** as `src/.../X.test.ts(x)` — not in a `tests/` mirror tree. A test for `src/foo/bar.ts` goes in `src/foo/bar.test.ts`.
- `src/functions/*` is pure color/data logic — write the test first, watch it fail, then implement (TDD). The existing color / harmony / tones / template / share-url tests follow that shape.
- Vitest runs under jsdom; config lives in `vite.config.ts` (there's no `vitest.config.ts`). Import `describe` / `it` / `expect` / `vi` from `vitest`.

## SPEC

The repo keeps a source-of-truth spec in [`SPEC/`](SPEC/), sliced per subsystem (`index`, `spa`, `state`, `color`, `testing`), in two parallel trees:

- `SPEC/CURRENT/<subsystem>.md` — the repo as it is now.
- `SPEC/TARGET/<subsystem>.md` — mirrors `CURRENT/` except where work is in flight (divergence is the signal).

Before changing a subsystem, read its `SPEC/CURRENT/<subsystem>.md`. When you open a non-trivial plan, update the relevant `SPEC/TARGET/<subsystem>.md` first; when you ship it, sync `SPEC/CURRENT/<subsystem>.md` to match **in the same commit as the implementation**. Each file is a verbal outline → a JSON serialisation → a control-flow diagram, written for agents as much as for humans. `.claude/.spec-enabled` opts the repo into the convention.

## A few things to know

- State lives in `src/context/` — a reducer (`paletteReducer.ts`) plus a React context (`PaletteContext.tsx`). Persistence: `localStorage` (`p4lette_*_v1` keys) and the URL hash (`#p=<hex>-<hex>-…`). If you add a `localStorage` key, `v1`-suffix it and give it a single owner module.
- Color math is OKLCH-first via `culori`; the generative tools use `rampensau` (coherent shuffle), `pro-color-harmonies` + `rybitten` (harmony), `dittotones` (tones). Color _names_ come from the `color.pizza` API — it fails soft (per-slot fallback to the previous name, else the hex).
- Don't add a dependency without saying which package and why in the same change.
