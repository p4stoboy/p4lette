export const SAVED_KEY = "p4lette_saved_v1";
export const SAVED_LIMIT = 20;

export interface SavedPalette {
  id: string;
  name: string;
  hexes: string[];
  createdAt: number;
}

export const defaultPaletteName = (ms: number): string => {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `palette-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
};

interface RawSavedPalette {
  id: string;
  hexes: string[];
  createdAt: number;
  name?: unknown;
}

const isValidEntry = (entry: unknown): entry is RawSavedPalette => {
  if (!entry || typeof entry !== "object") return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.createdAt === "number" &&
    Array.isArray(e.hexes) &&
    e.hexes.every((h) => typeof h === "string")
  );
};

const normalize = (e: RawSavedPalette): SavedPalette => ({
  id: e.id,
  name:
    typeof e.name === "string" && e.name.trim() !== ""
      ? e.name
      : defaultPaletteName(e.createdAt),
  hexes: e.hexes,
  createdAt: e.createdAt,
});

export const loadSaved = (): SavedPalette[] => {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry).map(normalize);
  } catch {
    return [];
  }
};

export const persistSaved = (list: SavedPalette[]): void => {
  if (typeof localStorage === "undefined") return;
  try {
    const trimmed = list.slice(0, SAVED_LIMIT);
    localStorage.setItem(SAVED_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore quota errors */
  }
};

export const newSavedId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
