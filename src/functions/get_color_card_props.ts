const colorNameCache = new Map<string, string>();

const normalizeKey = (hex: string): string =>
  hex.toLowerCase().replace("#", "");

export const clearColorNameCache = (): void => {
  colorNameCache.clear();
};

export const getColorName = async (
  hex: string,
  fallback?: string,
): Promise<string> => {
  const key = normalizeKey(hex);
  const cached = colorNameCache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://api.color.pizza/v1/?values=${key}&list=default`,
    );
    if (!res.ok) return fallback || hex;
    const json = await res.json();
    const name = json?.colors?.[0]?.name;
    if (typeof name === "string" && name.trim()) {
      colorNameCache.set(key, name);
      return name;
    }
  } catch {
    /* fall through */
  }
  return fallback || hex;
};
