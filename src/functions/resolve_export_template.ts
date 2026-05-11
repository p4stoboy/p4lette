import { Palette } from "../types/Palette";
import { hexToHsl, hexToHsv, hexToOklch, hexToRgb } from "./color_converters";

export const DEFAULT_TEMPLATE =
  "// refer to a color by its 1-based id:\n" +
  "$1$\n\n" +
  "// pluck a single property (name, hex, rgb, hsl):\n" +
  "$1.hex$\n\n" +
  "// arrays of selected ids:\n" +
  "$[1,3].name$\n\n" +
  "// or all of them:\n" +
  "{\n" +
  "  palette: $[all].hex$,\n" +
  "  primary: $1.hex$\n" +
  "}";

interface ResolvedColor {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  oklch: { l: number; c: number; h: number };
}

const fmt = (v: unknown): string =>
  typeof v === "object" ? JSON.stringify(v) : String(v);

const round1 = (n: number): number => Math.round(n * 10) / 10;
const round3 = (n: number): number => Math.round(n * 1000) / 1000;

export const resolveTemplate = (
  template: string,
  palette: Palette,
  names: string[],
): string => {
  const colorAt = (i: number): ResolvedColor | null => {
    const c = palette[i - 1];
    if (!c) return null;
    const rgb = hexToRgb(c.hex);
    const hsl = hexToHsl(c.hex);
    const hsv = hexToHsv(c.hex);
    const oklch = hexToOklch(c.hex);
    return {
      name: names[i - 1] || c.hex,
      hex: c.hex,
      rgb: { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) },
      hsl: { h: Math.round(hsl.h), s: Math.round(hsl.s), l: Math.round(hsl.l) },
      hsv: { h: Math.round(hsv.h), s: Math.round(hsv.s), v: Math.round(hsv.v) },
      oklch: { l: round1(oklch.l), c: round3(oklch.c), h: round1(oklch.h) },
    };
  };

  return template.replace(/\$([^$]+)\$/g, (m, expr: string) => {
    try {
      const arrayMatch = expr.match(/^\[([^\]]+)\](?:\.(\w+))?$/);
      if (arrayMatch) {
        const sel = arrayMatch[1].trim();
        const prop = arrayMatch[2] as keyof ResolvedColor | undefined;
        let ids: number[] = [];
        if (sel === "all") {
          ids = palette.map((_, i) => i + 1);
        } else {
          ids = sel
            .split(",")
            .map((n) => parseInt(n.trim(), 10))
            .filter(Number.isFinite);
        }
        const items = ids
          .map(colorAt)
          .filter((it): it is ResolvedColor => it !== null);
        if (!items.length) return `[ERROR: no ids in ${m}]`;
        return prop ? fmt(items.map((it) => it[prop])) : fmt(items);
      }

      const singleMatch = expr.match(/^(\d+)(?:\.(\w+))?$/);
      if (singleMatch) {
        const id = parseInt(singleMatch[1], 10);
        const prop = singleMatch[2] as keyof ResolvedColor | undefined;
        const it = colorAt(id);
        if (!it) return `[ERROR: no color ${id}]`;
        if (!prop) return fmt(it);
        if (it[prop] === undefined) return `[ERROR: no prop ${prop}]`;
        return fmt(it[prop]);
      }

      return `[ERROR: bad expr ${m}]`;
    } catch {
      return `[ERROR: ${m}]`;
    }
  });
};
