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

export interface ExportPreset {
  key: string;
  label: string;
  body: string;
}

// Built-in starting points for the export template. The per-`--color-N` ones
// target the default 5-colour palette (the grammar has no loop, so they can't
// adapt to any length — a shorter palette renders `[ERROR: no color N]` on the
// extra lines, a longer one just isn't fully covered); the `$[all]…` ones adapt
// to whatever the palette is.
export const EXPORT_PRESETS: readonly ExportPreset[] = [
  {
    key: "css-vars",
    label: "CSS CUSTOM PROPERTIES",
    body:
      ":root {\n" +
      "  --color-1: $1.hex$;\n" +
      "  --color-2: $2.hex$;\n" +
      "  --color-3: $3.hex$;\n" +
      "  --color-4: $4.hex$;\n" +
      "  --color-5: $5.hex$;\n" +
      "}",
  },
  {
    key: "css-oklch",
    label: "CSS OKLCH VARS",
    body:
      ":root {\n" +
      "  --color-1: oklch($1.oklchCss$);\n" +
      "  --color-2: oklch($2.oklchCss$);\n" +
      "  --color-3: oklch($3.oklchCss$);\n" +
      "  --color-4: oklch($4.oklchCss$);\n" +
      "  --color-5: oklch($5.oklchCss$);\n" +
      "}",
  },
  {
    key: "tailwind",
    label: "TAILWIND colors{}",
    body:
      "// tailwind.config — theme.extend.colors\n" +
      "palette: {\n" +
      '  1: "$1.hex$",\n' +
      '  2: "$2.hex$",\n' +
      '  3: "$3.hex$",\n' +
      '  4: "$4.hex$",\n' +
      '  5: "$5.hex$",\n' +
      "}",
  },
  {
    key: "json",
    label: "JSON ARRAY",
    body: '{\n  "colors": $[all].hex$,\n  "names": $[all].name$\n}',
  },
  {
    key: "hex-list",
    label: "PLAIN HEX LIST",
    body: "$[all].hex$",
  },
  {
    key: "name-hex",
    label: "NAME — HEX",
    body:
      "$1.name$  $1.hex$\n" +
      "$2.name$  $2.hex$\n" +
      "$3.name$  $3.hex$\n" +
      "$4.name$  $4.hex$\n" +
      "$5.name$  $5.hex$",
  },
  {
    key: "swift",
    label: "SWIFTUI COLORS",
    body:
      "import SwiftUI\n\n" +
      "extension Color {\n" +
      '  static let palette1 = Color(hex: "$1.hex$")\n' +
      '  static let palette2 = Color(hex: "$2.hex$")\n' +
      '  static let palette3 = Color(hex: "$3.hex$")\n' +
      '  static let palette4 = Color(hex: "$4.hex$")\n' +
      '  static let palette5 = Color(hex: "$5.hex$")\n' +
      "}",
  },
];

interface ResolvedColor {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  oklch: { l: number; c: number; h: number };
  // CSS-ready strings — `rgb($1.rgbCss$)`, `hsl($1.hslCss$)`, `oklch($1.oklchCss$)`.
  rgbCss: string;
  hslCss: string;
  oklchCss: string;
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
    const r = Math.round(rgb.r);
    const g = Math.round(rgb.g);
    const b = Math.round(rgb.b);
    const hh = Math.round(hsl.h);
    const ss = Math.round(hsl.s);
    const ll = Math.round(hsl.l);
    const ol = round1(oklch.l);
    const oc = round3(oklch.c);
    const oh = round1(oklch.h);
    return {
      name: names[i - 1] || c.hex,
      hex: c.hex,
      rgb: { r, g, b },
      hsl: { h: hh, s: ss, l: ll },
      hsv: { h: Math.round(hsv.h), s: Math.round(hsv.s), v: Math.round(hsv.v) },
      oklch: { l: ol, c: oc, h: oh },
      rgbCss: `${r}, ${g}, ${b}`,
      hslCss: `${hh}, ${ss}%, ${ll}%`,
      oklchCss: `${ol} ${oc} ${oh}`,
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
