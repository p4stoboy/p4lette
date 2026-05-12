import { useState } from "react";
import {
  RAMP_SETS,
  TONE_METHODS,
  dittoMatch,
  tones,
} from "../../../functions/tones";
import { POSTER } from "../tokens";
import { BasePicker, SwatchRow, Toggle } from "./shared";
import {
  BodyProps,
  rowsStyle,
  pillRowStyle,
  pillRowLabelStyle,
} from "./styles";

// TONES — perceptual tone scales from a seed colour (ditto / oklch / hsv / gen).
// The DITTOTONES row blends against a pickable reference ramp set (Tailwind v4
// default; Radix / Flexoki / Shoelace also bundled).
export const TonesBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const [base, setBase] = useState(palette[0]?.hex ?? "#ff3d00");
  const [set, setSet] = useState(RAMP_SETS[0].key);
  const setLabel = (RAMP_SETS.find((s) => s.key === set) ?? RAMP_SETS[0]).label;
  const match = dittoMatch(base, set);
  return (
    <>
      <BasePicker
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        label="SEED COLOR"
        value={base}
        onChange={setBase}
      >
        <div style={{ marginTop: 12 }}>
          <div style={pillRowLabelStyle()}>RAMP SET · DITTOTONES</div>
          <div style={pillRowStyle()}>
            {RAMP_SETS.map((s) => (
              <Toggle
                key={s.key}
                ink={ink}
                active={s.key === set}
                tall={isMobile}
                onClick={() => setSet(s.key)}
              >
                {s.label}
              </Toggle>
            ))}
          </div>
        </div>
      </BasePicker>
      <div style={rowsStyle()}>
        {TONE_METHODS.map((m) => {
          const scale = tones(base, m.id, set);
          const caption =
            m.id === "ditto"
              ? `${m.caption} · ${setLabel} · matched ${match.shade} (${match.method})`
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
