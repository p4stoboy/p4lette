export interface ColorList {
  key: string;
  title: string;
}

interface ListDescription {
  title?: unknown;
}

interface ListsResponse {
  availableColorNameLists?: unknown;
  listDescriptions?: Record<string, ListDescription>;
}

let cache: Promise<ColorList[]> | null = null;

const fetchLists = async (): Promise<ColorList[]> => {
  const res = await fetch("https://api.color.pizza/v1/lists/");
  if (!res.ok) throw new Error(`color.pizza/lists ${res.status}`);
  const json = (await res.json()) as ListsResponse;
  const keys = Array.isArray(json.availableColorNameLists)
    ? (json.availableColorNameLists as unknown[]).filter(
        (k): k is string => typeof k === "string",
      )
    : [];
  const descs = json.listDescriptions ?? {};
  return keys
    .filter((k) => !k.startsWith("mlmc_"))
    .map((k) => {
      const t = descs[k]?.title;
      return { key: k, title: typeof t === "string" && t.trim() ? t : k };
    });
};

export const loadColorLists = (): Promise<ColorList[]> => {
  if (!cache) {
    cache = fetchLists().catch((e) => {
      cache = null;
      throw e;
    });
  }
  return cache;
};

export const resetColorListsCache = (): void => {
  cache = null;
};
