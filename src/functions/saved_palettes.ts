export const SAVED_KEY = "p4lette_saved_v1";
export const SAVED_LIMIT = 20;

export interface SavedPalette {
  id: string;
  hexes: string[];
  createdAt: number;
}

const isValidEntry = (entry: unknown): entry is SavedPalette => {
  if (!entry || typeof entry !== "object") return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.createdAt === "number" &&
    Array.isArray(e.hexes) &&
    e.hexes.every((h) => typeof h === "string")
  );
};

export const loadSaved = (): SavedPalette[] => {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
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
