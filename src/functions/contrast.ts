import { hexToRgb } from "./color_converters";

export const luminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number): number => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

export const contrast = (a: string, b: string): number => {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

export const fontColorFor = (hex: string): string =>
  contrast(hex, "#000000") > contrast(hex, "#ffffff") ? "#000000" : "#ffffff";
