import { HSLColor, RGBColor } from "../types/Colors";

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

export const hexToRgb = (hex: string): RGBColor => {
  const h = hex.replace("#", "");
  const n =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const num = parseInt(n, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
};

export const rgbToHex = ({ r, g, b }: RGBColor): string => {
  const to = (v: number) =>
    clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
  return "#" + to(r) + to(g) + to(b);
};

export const rgbToHsl = ({ r, g, b }: RGBColor): HSLColor => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

export const hslToRgb = ({ h, s, l }: HSLColor): RGBColor => {
  const hue = (((h % 360) + 360) % 360) / 360;
  const sat = clamp(s, 0, 100) / 100;
  const lum = clamp(l, 0, 100) / 100;
  if (sat === 0) {
    const v = lum * 255;
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = lum < 0.5 ? lum * (1 + sat) : lum + sat - lum * sat;
  const p = 2 * lum - q;
  return {
    r: hue2rgb(p, q, hue + 1 / 3) * 255,
    g: hue2rgb(p, q, hue) * 255,
    b: hue2rgb(p, q, hue - 1 / 3) * 255,
  };
};

export const hexToHsl = (hex: string): HSLColor => rgbToHsl(hexToRgb(hex));
export const hslToHex = (hsl: HSLColor): string => rgbToHex(hslToRgb(hsl));

export const randomHex = (): string => {
  const h = Math.random() * 360;
  const s = 35 + Math.random() * 55;
  const l = 30 + Math.random() * 50;
  return hslToHex({ h, s, l });
};
