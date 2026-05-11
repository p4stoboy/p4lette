export const SAVED_TEMPLATES_KEY = "p4lette_saved_templates_v1";
export const SAVED_TEMPLATES_LIMIT = 20;

export interface SavedTemplate {
  id: string;
  name: string;
  body: string;
  createdAt: number;
}

const isValidEntry = (entry: unknown): entry is SavedTemplate => {
  if (!entry || typeof entry !== "object") return false;
  const e = entry as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.name === "string" &&
    typeof e.body === "string" &&
    typeof e.createdAt === "number"
  );
};

export const loadSavedTemplates = (): SavedTemplate[] => {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_TEMPLATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
};

export const persistSavedTemplates = (list: SavedTemplate[]): void => {
  if (typeof localStorage === "undefined") return;
  try {
    const trimmed = list.slice(0, SAVED_TEMPLATES_LIMIT);
    localStorage.setItem(SAVED_TEMPLATES_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore quota errors */
  }
};

export const newSavedTemplateId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
