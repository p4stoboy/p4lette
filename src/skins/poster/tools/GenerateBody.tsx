import { useState } from "react";
import { SmallBtn } from "../Backdrop";
import { usePalette } from "../../../context/PaletteContext";
import {
  GEN_STRATEGIES,
  GenStrategy,
  RAMP_PARAM_META,
  RampParams,
  defaultRampParams,
  generatePalette,
} from "../../../functions/generate_palette";
import { POSTER } from "../tokens";
import { RangeRow, SwatchRow, Toggle } from "./shared";
import { BodyProps, rowsStyle, pillRowStyle } from "./styles";

// SHUFFLE SETTINGS — pick the palette-generation strategy the SHUFFLE button
// uses (and, for rampensau, tune its ramp), preview it, REGENERATE within the
// bounds, and USE — which both applies the preview *and* commits the
// strategy/params so the nav SHUFFLE button (and the `Space` shortcut) use them.
export const GenerateBody = ({
  ink,
  isMobile,
  palette,
  onApply,
}: BodyProps) => {
  const { genStrategy, genParams, setGenConfig } = usePalette();
  const n = Math.max(palette.length, 1);
  const roll = (s: GenStrategy, p: RampParams): string[] =>
    generatePalette(n, s, Math.random, s === "rampensau" ? p : undefined);
  const [strategy, setStrategy] = useState<GenStrategy>(genStrategy);
  const [params, setParams] = useState<RampParams>(
    genParams ?? defaultRampParams(),
  );
  // The preview re-rolls on the events that should change it (strategy switch,
  // a slider move, REGEN) — never in an effect.
  const [preview, setPreview] = useState<string[]>(() =>
    roll(genStrategy, genParams ?? defaultRampParams()),
  );
  const pickStrategy = (s: GenStrategy) => {
    setStrategy(s);
    setPreview(roll(s, params));
  };
  const setParam = (k: keyof RampParams) => (v: number) => {
    const next = { ...params, [k]: v };
    setParams(next);
    if (strategy === "rampensau") setPreview(roll(strategy, next));
  };
  const commit = () => {
    onApply(preview);
    setGenConfig({
      strategy,
      params: strategy === "rampensau" ? params : null,
    });
  };
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
            marginBottom: 4,
          }}
        >
          STRATEGY
        </div>
        <div
          style={{
            fontFamily: POSTER.body,
            fontSize: 10,
            letterSpacing: "0.04em",
            opacity: 0.6,
            marginBottom: 8,
          }}
        >
          sets how the SHUFFLE button builds a fresh palette
        </div>
        <div style={pillRowStyle()}>
          {GEN_STRATEGIES.map((s) => (
            <Toggle
              key={s.key}
              ink={ink}
              active={strategy === s.key}
              tall={isMobile}
              onClick={() => pickStrategy(s.key)}
            >
              {s.label}
            </Toggle>
          ))}
        </div>
        {strategy === "rampensau" && (
          <div style={{ marginTop: 12 }}>
            <RangeRow
              ink={ink}
              label="SAT LO"
              meta={RAMP_PARAM_META.sLo}
              value={params.sLo}
              onChange={setParam("sLo")}
            />
            <RangeRow
              ink={ink}
              label="SAT HI"
              meta={RAMP_PARAM_META.sHi}
              value={params.sHi}
              onChange={setParam("sHi")}
            />
            <RangeRow
              ink={ink}
              label="LIGHT LO"
              meta={RAMP_PARAM_META.lLo}
              value={params.lLo}
              onChange={setParam("lLo")}
            />
            <RangeRow
              ink={ink}
              label="LIGHT HI"
              meta={RAMP_PARAM_META.lHi}
              value={params.lHi}
              onChange={setParam("lHi")}
            />
            <RangeRow
              ink={ink}
              label="HUE SPAN"
              meta={RAMP_PARAM_META.hueSpan}
              value={params.hueSpan}
              onChange={setParam("hueSpan")}
            />
            <RangeRow
              ink={ink}
              label="CURVE ACCENT"
              meta={RAMP_PARAM_META.curveAccent}
              value={params.curveAccent}
              onChange={setParam("curveAccent")}
            />
          </div>
        )}
      </div>
      <div style={rowsStyle()}>
        <SwatchRow
          ink={ink}
          isMobile={isMobile}
          colors={preview}
          swatchHeight={isMobile ? 76 : 56}
          onUse={commit}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              PREVIEW
            </div>
            <SmallBtn
              ink={ink}
              tall={isMobile}
              onClick={() => setPreview(roll(strategy, params))}
            >
              REGEN
            </SmallBtn>
          </div>
        </SwatchRow>
      </div>
    </>
  );
};
