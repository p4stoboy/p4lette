import { useState } from "react";
import {
  BLEND_MODES,
  BlendMode,
  EFFECTS,
  applyEffect,
  blendWith,
} from "../../../functions/color_filters";
import { POSTER } from "../tokens";
import { BasePicker, SwatchRow, Toggle } from "./shared";
import {
  BodyProps,
  rowsStyle,
  pillRowStyle,
  pillRowLabelStyle,
} from "./styles";

// EFFECTS — one-shot culori filters over the live palette + a "blend the whole
// palette under a colour" control. No seed; reads the live palette.
export const EffectsBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const [over, setOver] = useState("#000000");
  const [mode, setMode] = useState<BlendMode>("multiply");
  const hexes = palette.map((c) => c.hex);
  const blended = blendWith(hexes, over, mode);
  const rowH = isMobile ? 76 : 56;
  return (
    <>
      <BasePicker
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        label="BLEND OVER"
        value={over}
        onChange={setOver}
      >
        <div style={{ marginTop: 12 }}>
          <div style={pillRowLabelStyle()}>BLEND MODE</div>
          <div style={pillRowStyle()}>
            {BLEND_MODES.map((m) => (
              <Toggle
                key={m}
                ink={ink}
                active={m === mode}
                tall={isMobile}
                onClick={() => setMode(m)}
              >
                {m}
              </Toggle>
            ))}
          </div>
        </div>
      </BasePicker>
      <div style={rowsStyle()}>
        <SwatchRow
          ink={ink}
          isMobile={isMobile}
          colors={blended}
          swatchHeight={rowH}
          onUse={() => onApply(blended)}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              BLEND · {mode.toUpperCase()}
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
              palette × {over}
            </div>
          </div>
        </SwatchRow>
        {EFFECTS.map((e) => {
          const out = applyEffect(hexes, e.key);
          return (
            <SwatchRow
              key={e.key}
              ink={ink}
              isMobile={isMobile}
              colors={out}
              swatchHeight={rowH}
              onUse={() => onApply(out)}
            >
              <div
                style={{
                  fontFamily: POSTER.display,
                  fontSize: 16,
                  letterSpacing: "0.02em",
                }}
              >
                {e.label}
              </div>
            </SwatchRow>
          );
        })}
      </div>
    </>
  );
};
