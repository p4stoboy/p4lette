export type HexColor = string;
export type RGBColor = { r: number; g: number; b: number };
export type HSLColor = { h: number; s: number; l: number };
export type HSVColor = { h: number; s: number; v: number };
export type OKLCHColor = { l: number; c: number; h: number };
export type ColorMode = "hex" | "rgb" | "hsl" | "hsv" | "oklch";
export type ColorProperty = "name" | "hex" | "rgb" | "hsl" | "hsv" | "oklch";
export type Colors = {
  name?: string;
  hex: HexColor;
  rgb: RGBColor;
  hsl: HSLColor;
  hsv: HSVColor;
  oklch: OKLCHColor;
};
