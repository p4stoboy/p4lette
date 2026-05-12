import { useState } from "react";
import {
  PIGMENT_CUBES,
  cubeCorners,
  pigmentFilter,
  pigmentWheel,
} from "../../../functions/pigment";
import { POSTER } from "../tokens";
import { SwatchRow, Toggle } from "./shared";
import { BodyProps, rowsStyle } from "./styles";

// PIGMENT — rybitten cube profiles as a print-like filter over the live palette.
// No seed colour; a profile picker drives all three rows.
export const PigmentBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const [cube, setCube] = useState(PIGMENT_CUBES[0]?.key ?? "itten");
  const active = PIGMENT_CUBES.find((c) => c.key === cube) ?? PIGMENT_CUBES[0];
  const hexes = palette.map((c) => c.hex);
  const filtered = pigmentFilter(hexes, cube);
  const wheel = pigmentWheel(cube, isMobile ? 7 : 11);
  const corners = cubeCorners(cube);
  const rowH = isMobile ? 76 : 56;
  const half = Math.ceil(PIGMENT_CUBES.length / 2);
  const cubeRows = [PIGMENT_CUBES.slice(0, half), PIGMENT_CUBES.slice(half)];
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
    <>
      <div
        style={{
          padding: "14px 16px",
          borderBottom: `2px solid ${ink}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: POSTER.body,
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: "0.12em",
            marginBottom: 8,
          }}
        >
          PROFILE
        </div>
        <div style={{ border: `2px solid ${ink}` }}>
          {cubeRows.map((row, ri) => (
            <div
              key={ri}
              style={{
                display: "flex",
                borderTop: ri > 0 ? `2px solid ${ink}` : undefined,
              }}
            >
              {row.map((c, i) => (
                <Toggle
                  key={c.key}
                  ink={ink}
                  active={c.key === cube}
                  tall={isMobile}
                  divide={i < row.length - 1}
                  onClick={() => setCube(c.key)}
                >
                  {c.label}
                </Toggle>
              ))}
            </div>
          ))}
        </div>
        {active && caption(active.meta)}
      </div>
      <div style={rowsStyle()}>
        <SwatchRow
          ink={ink}
          isMobile={isMobile}
          colors={filtered}
          swatchHeight={rowH}
          onUse={() => onApply(filtered)}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              FILTER
            </div>
            {caption(
              `your palette as ${active?.label ?? cube} would mix it — print-like`,
            )}
          </div>
        </SwatchRow>
        <SwatchRow
          ink={ink}
          isMobile={isMobile}
          colors={wheel}
          swatchHeight={rowH}
          onUse={() => onApply(wheel)}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              WHEEL
            </div>
            {caption("the cube's own colour wheel — pigment mixing, not light")}
          </div>
        </SwatchRow>
        <SwatchRow
          ink={ink}
          isMobile={isMobile}
          colors={corners}
          swatchHeight={rowH}
          onUse={() => onApply(corners)}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              THIS CUBE
            </div>
            {caption(
              "corners: white · red · yellow · orange · blue · violet · green · black",
            )}
          </div>
        </SwatchRow>
      </div>
    </>
  );
};
