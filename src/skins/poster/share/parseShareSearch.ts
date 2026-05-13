import { decodePalette } from "../../../functions/share_url";

// Pull the `p=` value out of a search string (`?p=rrggbb-rrggbb-…` — from
// `location.search` after a `/share` path) and run it through the codec.
// `null` when there's no usable palette (→ the page shows a "nothing to
// show" state). NB: never hand the *raw* `?p=…` string to `decodePalette` —
// its `replace(/^#?p=/, "")` is anchored to `p=`, so it would split the whole
// input on `-` and silently drop colour 0; extract via URLSearchParams first.
export const parseShareSearch = (search: string): string[] | null => {
  if (!search) return null;
  const q = search.indexOf("?");
  const params = new URLSearchParams(q === -1 ? search : search.slice(q + 1));
  const p = params.get("p");
  return p ? decodePalette(p) : null;
};
