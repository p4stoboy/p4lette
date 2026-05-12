import { useState } from "react";
import { TONE_METHODS, dittoMatch, tones } from "../../../functions/tones";
import { POSTER } from "../tokens";
import { BasePicker, SwatchRow } from "./shared";
import { BodyProps, rowsStyle } from "./styles";

// TONES — perceptual tone scales from a seed colour (ditto / oklch / hsv / gen).
export const TonesBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const [base, setBase] = useState(palette[0]?.hex ?? "#ff3d00");
  const match = dittoMatch(base);
  return (
    <>
      <BasePicker
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        label="SEED COLOR"
        value={base}
        onChange={setBase}
      />
      <div style={rowsStyle()}>
        {TONE_METHODS.map((m) => {
          const scale = tones(base, m.id);
          const caption =
            m.id === "ditto"
              ? `${m.caption} · matched ${match.shade} (${match.method})`
              : m.caption;
          return (
            <SwatchRow
              key={m.id}
              ink={ink}
              isMobile={isMobile}
              colors={scale}
              swatchHeight={isMobile ? 64 : 48}
              onUse={() => onApply(scale)}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: POSTER.display,
                    fontSize: 16,
                    letterSpacing: "0.02em",
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontFamily: POSTER.body,
                    fontSize: 10,
                    letterSpacing: "0.04em",
                    opacity: 0.6,
                    marginTop: 2,
                  }}
                >
                  {caption}
                </div>
              </div>
            </SwatchRow>
          );
        })}
      </div>
    </>
  );
};
