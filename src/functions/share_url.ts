import { Palette } from "../types/Palette";

const HEX_RE = /^#[0-9a-f]{6}$/i;

export const encodePalette = (palette: Palette): string =>
  palette.map((c) => c.hex.replace("#", "")).join("-");

export const decodePalette = (
  raw: string | null | undefined,
): string[] | null => {
  if (!raw) return null;
  const stripped = raw.replace(/^#?p=/, "");
  if (!stripped) return null;
  const parts = stripped
    .split("-")
    .filter(Boolean)
    .map((p) => "#" + p);
  const valid = parts.filter((p) => HEX_RE.test(p));
  return valid.length ? valid.map((h) => h.toLowerCase()) : null;
};
