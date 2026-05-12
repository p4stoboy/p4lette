import {
  type Color,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  filterDeficiencyTrit,
  formatHex,
  parse,
  toGamut,
} from "culori";

export type CvdType = "prot" | "deuter" | "trit";

const mapHexes = (
  hexes: string[],
  fn: (c: Color) => Color | undefined,
): string[] =>
  hexes.map((h) => {
    const parsed = parse(h);
    const out = parsed ? fn(parsed) : undefined;
    return out ? (formatHex(out) ?? h) : h;
  });

// Simulate how `hexes` reads to a viewer with the given colour-vision
// deficiency (Brettel/Viénot, full severity). Non-destructive — just a preview.
export const simulateCvd = (hexes: string[], type: CvdType): string[] => {
  const sim =
    type === "prot"
      ? filterDeficiencyProt(1)
      : type === "deuter"
        ? filterDeficiencyDeuter(1)
        : filterDeficiencyTrit(1);
  return mapHexes(hexes, sim);
};

// Pull every swatch into the displayable sRGB gamut by reducing chroma in
// OKLCH (hue/lightness preserved). A no-op on colours that are already in gamut.
const intoSrgb = toGamut("rgb", "oklch");
export const snapToGamut = (hexes: string[]): string[] =>
  mapHexes(hexes, intoSrgb);
