# P4LETTE

P4LETTE is a small React color palette tool. It generates editable colors, names them through the external `color.pizza` API, and resolves custom export templates for copying palette data into other projects.

## Scripts

- `npm run dev` starts the Vite dev server.
- `npm run build` runs TypeScript checking and creates a production build in `dist/`.
- `npm run preview` serves the production build locally.
- `npm test` runs the Vitest suite once.
- `npm run test:watch` runs Vitest in watch mode.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run lint` runs ESLint over the project.

## Export Templates

Template placeholders are wrapped in `$...$` and use 1-based color ids.

- `$1$` resolves the full first color object.
- `$1.hex$`, `$1.name$`, `$1.rgb$`, and `$1.hsl$` resolve supported properties.
- `$[1,3].name$` resolves an array from selected ids.
- `$[all].hex$` resolves an array for the full palette.

Invalid ids, selectors, or properties resolve to explicit error text so the export panel stays usable.

## Notes

- Color-name lookups depend on `https://api.color.pizza/v1/`.
- Each palette change triggers a single batched request with `noduplicates=true`, so names are re-resolved for the whole palette in context (and can change as colors are added, removed, or edited).
- Failed lookups fall back to the previous name or the hex value, per slot.
