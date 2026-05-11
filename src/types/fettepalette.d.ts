// fettepalette ships a `.d.ts` but its package.json `exports` map omits a
// "types" condition, so `moduleResolution: bundler` can't find it. Declare the
// slice we use here.
declare module "fettepalette" {
  export type ColorModel = "hsl" | "hsv" | "lch" | "oklch";
  export type Vector2 = [number, number];
  export type Vector3 = [number, number, number];

  export interface GenerateRandomColorRampArgument {
    total?: number;
    centerHue?: number;
    hueCycle?: number;
    offsetTint?: number;
    offsetShade?: number;
    curveAccent?: number;
    tintShadeHueShift?: number;
    curveMethod?: string;
    offsetCurveModTint?: number;
    offsetCurveModShade?: number;
    minSaturationLight?: Vector2;
    maxSaturationLight?: Vector2;
    colorModel?: ColorModel;
  }

  export function generateRandomColorRamp(
    args?: GenerateRandomColorRampArgument,
  ): {
    light: Vector3[];
    dark: Vector3[];
    base: Vector3[];
    all: Vector3[];
  };
}
