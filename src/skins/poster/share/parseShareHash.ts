import { decodePalette } from "../../../functions/share_url";

const SHARE_PREFIX = "#/share";

// True when the location hash is the share-page route.
export const isShareHash = (hash: string): boolean =>
  hash === SHARE_PREFIX ||
  hash.startsWith(SHARE_PREFIX + "?") ||
  hash.startsWith(SHARE_PREFIX + "/");

// Pull the `p=` value out of `#/share?p=rrggbb-rrggbb-…` and run it through the
// existing codec. `null` when there's no usable palette (→ the page shows a
// "nothing to show" state). NB: never hand the *raw* `#/share?p=…` string to
// `decodePalette` — its `replace(/^#?p=/,"")` is anchored to `p=`, so it would
// split the whole hash on `-` and silently drop colour 0; extract `?p=` first.
export const parseShareHash = (hash: string): string[] | null => {
  if (!isShareHash(hash)) return null;
  const q = hash.indexOf("?");
  if (q === -1) return null;
  const p = new URLSearchParams(hash.slice(q + 1)).get("p");
  return p ? decodePalette(p) : null;
};
