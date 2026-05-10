const normalizeKey = (hex: string): string =>
  hex.toLowerCase().replace("#", "");

export const DEFAULT_NAME_LIST = "bestOf";

export interface GetColorNamesOptions {
  list?: string;
  fallbacks?: string[];
}

export const getColorNames = async (
  hexes: string[],
  options: GetColorNamesOptions = {},
): Promise<string[]> => {
  if (hexes.length === 0) return [];
  const { list = DEFAULT_NAME_LIST, fallbacks } = options;
  const fb = (i: number): string => fallbacks?.[i] ?? hexes[i];
  const keys = hexes.map(normalizeKey).join(",");

  try {
    const res = await fetch(
      `https://api.color.pizza/v1/?values=${keys}&noduplicates=true&list=${encodeURIComponent(list)}`,
    );
    if (!res.ok) return hexes.map((_, i) => fb(i));
    const json = await res.json();
    const colors = Array.isArray(json?.colors) ? json.colors : [];
    return hexes.map((_, i) => {
      const name = colors[i]?.name;
      return typeof name === "string" && name.trim() ? name : fb(i);
    });
  } catch {
    return hexes.map((_, i) => fb(i));
  }
};
