import {
  CvdType,
  simulateCvd,
  snapToGamut,
} from "../../../functions/color_filters";
import { POSTER } from "../tokens";
import { SwatchRow } from "./shared";
import { BodyProps, rowsStyle } from "./styles";

const CVD_LABELS: Record<CvdType, string> = {
  prot: "PROTANOPIA",
  deuter: "DEUTERANOPIA",
  trit: "TRITANOPIA",
};
const CVD_TYPES: CvdType[] = ["prot", "deuter", "trit"];

// FIXERS — operates on the *live* palette (no seed). The CVD rows are a
// non-destructive preview; USE applies the transformed palette.
export const FixersBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const hexes = palette.map((c) => c.hex);
  const snapped = snapToGamut(hexes);
  const alreadyOk = snapped.join() === hexes.join();
  const rowH = isMobile ? 76 : 56;
  const caption = (text: string) => (
    <div
      style={{
        fontFamily: POSTER.body,
        fontSize: 10,
        letterSpacing: "0.04em",
        opacity: 0.6,
        marginTop: 2,
      }}
    >
      {text}
    </div>
  );
  return (
    <div style={rowsStyle()}>
      {CVD_TYPES.map((type) => {
        const sim = simulateCvd(hexes, type);
        return (
          <SwatchRow
            key={type}
            ink={ink}
            isMobile={isMobile}
            colors={sim}
            swatchHeight={rowH}
            onUse={() => onApply(sim)}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: POSTER.display,
                  fontSize: 16,
                  letterSpacing: "0.02em",
                }}
              >
                {CVD_LABELS[type]}
              </div>
              {caption(
                `simulated — how this palette reads with ${CVD_LABELS[
                  type
                ].toLowerCase()}`,
              )}
            </div>
          </SwatchRow>
        );
      })}
      <SwatchRow
        ink={ink}
        isMobile={isMobile}
        colors={snapped}
        swatchHeight={rowH}
        onUse={() => onApply(snapped)}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: POSTER.display,
              fontSize: 16,
              letterSpacing: "0.02em",
            }}
          >
            IN-GAMUT sRGB
          </div>
          {caption(
            alreadyOk
              ? "every swatch is already displayable"
              : "every swatch snapped into displayable sRGB",
          )}
        </div>
      </SwatchRow>
    </div>
  );
};
