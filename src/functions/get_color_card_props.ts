const normalizeKey = (hex: string): string =>
  hex.toLowerCase().replace("#", "");

export const getColorNames = async (
  hexes: string[],
  fallbacks?: string[],
): Promise<string[]> => {
  if (hexes.length === 0) return [];
  const fb = (i: number): string => fallbacks?.[i] ?? hexes[i];
  const keys = hexes.map(normalizeKey).join(",");

  try {
    const res = await fetch(
      `https://api.color.pizza/v1/?values=${keys}&noduplicates=true&list=bestOf`,
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
