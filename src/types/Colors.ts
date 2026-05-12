export type HexColor = string;
export type RGBColor = { r: number; g: number; b: number };
export type HSLColor = { h: number; s: number; l: number };
export type HSVColor = { h: number; s: number; v: number };
export type OKLCHColor = { l: number; c: number; h: number };
// Okhsl — perceptually-even cylindrical OKLab (Björn Ottosson). h 0–360, s/l 0–1.
export type OkhslColor = { h: number; s: number; l: number };
export type ColorMode = "hex" | "rgb" | "hsl" | "hsv" | "oklch";
// What the footer MODE picker offers / what `colorMode` stores: the five formats
// plus `"all"` (every format stacked under each swatch — the default).
export type DisplayMode = ColorMode | "all";
// The colour space the inline EDIT tray edits in — its text input and its three
// sliders. `"okhsl"` (the perceptual default) uses a hex text input.
export type EditSpace = "okhsl" | "rgb" | "hsl" | "hsv" | "oklch";
export type ColorProperty = "name" | "hex" | "rgb" | "hsl" | "hsv" | "oklch";
export type Colors = {
  name?: string;
  hex: HexColor;
  rgb: RGBColor;
  hsl: HSLColor;
  hsv: HSVColor;
  oklch: OKLCHColor;
};
