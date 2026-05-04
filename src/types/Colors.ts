export type HexColor = string;
export type RGBColor = { r: number; g: number; b: number };
export type HSLColor = { h: number; s: number; l: number };
export type ColorProperty = "name" | "hex" | "rgb" | "hsl";
export type Colors = {
  name?: string;
  hex: HexColor;
  rgb: RGBColor;
  hsl: HSLColor;
};
