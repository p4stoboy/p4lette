import { formatHex, okhsl } from "culori";
import {
  ColorMode,
  HSLColor,
  HSVColor,
  OkhslColor,
  OKLCHColor,
  RGBColor,
} from "../types/Colors";

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

export const rgbToHsv = ({ r, g, b }: RGBColor): HSVColor => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }
  return { h, s: s * 100, v: v * 100 };
};

export const hsvToRgb = ({ h, s, v }: HSVColor): RGBColor => {
  const hue = (((h % 360) + 360) % 360) / 60;
  const sat = clamp(s, 0, 100) / 100;
  const val = clamp(v, 0, 100) / 100;
  const c = val * sat;
  const x = c * (1 - Math.abs((hue % 2) - 1));
  const m = val - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 1) {
    r = c;
    g = x;
  } else if (hue < 2) {
    r = x;
    g = c;
  } else if (hue < 3) {
    g = c;
    b = x;
  } else if (hue < 4) {
    g = x;
    b = c;
  } else if (hue < 5) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
};

export const hexToHsv = (hex: string): HSVColor => rgbToHsv(hexToRgb(hex));
export const hsvToHex = (hsv: HSVColor): string => rgbToHex(hsvToRgb(hsv));

const srgbToLinear = (c: number): number => {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
};

const linearToSrgb = (x: number): number => {
  const c = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  return c * 255;
};

export const rgbToOklch = ({ r, g, b }: RGBColor): OKLCHColor => {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(a * a + bb * bb);
  let H = (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { l: L * 100, c: C, h: H };
};

export const oklchToRgb = ({ l, c, h }: OKLCHColor): RGBColor => {
  const L = l / 100;
  const hr = (h * Math.PI) / 180;
  const a = c * Math.cos(hr);
  const b = c * Math.sin(hr);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const lr_lin = l_ * l_ * l_;
  const mr_lin = m_ * m_ * m_;
  const sr_lin = s_ * s_ * s_;
  const lr =
    4.0767416621 * lr_lin - 3.3077115913 * mr_lin + 0.2309699292 * sr_lin;
  const lg =
    -1.2684380046 * lr_lin + 2.6097574011 * mr_lin - 0.3413193965 * sr_lin;
  const lb =
    -0.0041960863 * lr_lin - 0.7034186147 * mr_lin + 1.707614701 * sr_lin;
  return {
    r: clamp(linearToSrgb(lr), 0, 255),
    g: clamp(linearToSrgb(lg), 0, 255),
    b: clamp(linearToSrgb(lb), 0, 255),
  };
};

export const hexToOklch = (hex: string): OKLCHColor =>
  rgbToOklch(hexToRgb(hex));
export const oklchToHex = (oklch: OKLCHColor): string =>
  rgbToHex(oklchToRgb(oklch));

// Okhsl — perceptually-even hue/sat/lum. Hand-rolling the gamut-aware S
// normalisation is a footgun, so this pair leans on culori. `h` is 0 for
// achromatic colours (culori leaves it undefined there). s/l are 0–1.
export const hexToOkhsl = (hex: string): OkhslColor => {
  const o = okhsl(hex);
  return o
    ? { h: o.h ?? 0, s: clamp(o.s, 0, 1), l: clamp(o.l, 0, 1) }
    : { h: 0, s: 0, l: 0 };
};
export const okhslToHex = ({ h, s, l }: OkhslColor): string =>
  formatHex({ mode: "okhsl", h, s: clamp(s, 0, 1), l: clamp(l, 0, 1) }) ??
  "#000000";

export const formatColor = (hex: string, mode: ColorMode): string => {
  switch (mode) {
    case "hex":
      return hex.toUpperCase();
    case "rgb": {
      const { r, g, b } = hexToRgb(hex);
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
    case "hsl": {
      const { h, s, l } = hexToHsl(hex);
      return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    }
    case "hsv": {
      const { h, s, v } = hexToHsv(hex);
      return `hsv(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(v)}%)`;
    }
    case "oklch": {
      const { l, c, h } = hexToOklch(hex);
      return `oklch(${l.toFixed(1)}%, ${c.toFixed(3)}, ${h.toFixed(2)})`;
    }
  }
};

const extractNumbers = (input: string): number[] => {
  const matches = input.match(/-?\d+(?:\.\d+)?/g);
  return matches ? matches.map(Number) : [];
};

export const parseColor = (input: string, mode: ColorMode): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (mode === "hex") {
    const m = trimmed.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return null;
    return (
      "#" +
      (m[1].length === 3
        ? m[1]
            .split("")
            .map((c) => c + c)
            .join("")
        : m[1]
      ).toLowerCase()
    );
  }
  const nums = extractNumbers(trimmed);
  if (mode === "rgb") {
    if (nums.length < 3) return null;
    return rgbToHex({
      r: clamp(nums[0], 0, 255),
      g: clamp(nums[1], 0, 255),
      b: clamp(nums[2], 0, 255),
    });
  }
  if (mode === "hsl") {
    if (nums.length < 3) return null;
    return hslToHex({
      h: nums[0],
      s: clamp(nums[1], 0, 100),
      l: clamp(nums[2], 0, 100),
    });
  }
  if (mode === "hsv") {
    if (nums.length < 3) return null;
    return hsvToHex({
      h: nums[0],
      s: clamp(nums[1], 0, 100),
      v: clamp(nums[2], 0, 100),
    });
  }
  if (mode === "oklch") {
    if (nums.length < 3) return null;
    const l = nums[0] <= 1 ? nums[0] * 100 : nums[0];
    return oklchToHex({
      l: clamp(l, 0, 100),
      c: Math.max(0, nums[1]),
      h: nums[2],
    });
  }
  return null;
};

export const randomHex = (): string => {
  const h = Math.random() * 360;
  const s = 35 + Math.random() * 55;
  const l = 30 + Math.random() * 50;
  return hslToHex({ h, s, l });
};
