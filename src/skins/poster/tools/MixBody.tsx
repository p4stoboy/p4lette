import { useState } from "react";
import {
  MIX_CURVES,
  MIX_SPACES,
  MIX_STEPS,
  MixCurve,
  MixSpace,
  mixSteps,
} from "../../../functions/color_mix";
import { POSTER } from "../tokens";
import { BasePicker, SwatchRow, Toggle } from "./shared";
import { BodyProps, rowsStyle } from "./styles";

// MIX — interpolate between two picked colours. Two stacked BasePickers
// (FROM / TO) over the live palette, then steps / space / curve toggles.
export const MixBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const [from, setFrom] = useState(palette[0]?.hex ?? "#ff3d00");
  const [to, setTo] = useState(palette[palette.length - 1]?.hex ?? "#00b4d8");
  const [n, setN] = useState(7);
  const [space, setSpace] = useState<MixSpace>("oklch");
  const [curve, setCurve] = useState<MixCurve>("even");
  const mixed = mixSteps(from, to, n, space, curve);
  return (
    <>
      <BasePicker
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        label="FROM COLOR"
        value={from}
        onChange={setFrom}
      />
      <BasePicker
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        label="TO COLOR"
        value={to}
        onChange={setTo}
      >
        <div style={{ marginTop: 12, border: `2px solid ${ink}` }}>
          <div style={{ display: "flex" }}>
            {MIX_STEPS.map((s, i) => (
              <Toggle
                key={s}
                ink={ink}
                active={n === s}
                tall={isMobile}
                divide={i < MIX_STEPS.length - 1}
                onClick={() => setN(s)}
              >
                {String(s)}
              </Toggle>
            ))}
          </div>
          <div style={{ display: "flex", borderTop: `2px solid ${ink}` }}>
            {MIX_SPACES.map((s, i) => (
              <Toggle
                key={s.key}
                ink={ink}
                active={space === s.key}
                tall={isMobile}
                divide={i < MIX_SPACES.length - 1}
                onClick={() => setSpace(s.key)}
              >
                {s.label}
              </Toggle>
            ))}
          </div>
          <div style={{ display: "flex", borderTop: `2px solid ${ink}` }}>
            {MIX_CURVES.map((c, i) => (
              <Toggle
                key={c.key}
                ink={ink}
                active={curve === c.key}
                tall={isMobile}
                divide={i < MIX_CURVES.length - 1}
                onClick={() => setCurve(c.key)}
              >
                {c.label}
              </Toggle>
            ))}
          </div>
        </div>
      </BasePicker>
      <div style={rowsStyle()}>
        <SwatchRow
          ink={ink}
          isMobile={isMobile}
          colors={mixed}
          swatchHeight={isMobile ? 76 : 56}
          onUse={() => onApply(mixed)}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              {n} STEPS
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
              {from} → {to} in {space.toUpperCase()}
            </div>
          </div>
        </SwatchRow>
      </div>
    </>
  );
};
