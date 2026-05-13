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
import { RangeRow, Toggle } from "../tools/shared";

interface Props {
  ink: string;
  isMobile: boolean;
}

// Pick the palette-generation strategy the RANDOMISE button uses (and, for
// rampensau, tune its ramp), PREVIEW it, REGEN within the bounds, and USE —
// which both applies the preview (`replaceAll`) *and* commits the
// strategy/params via `setGenConfig`, so the nav RANDOMISE button (and the
// `Space` shortcut) use them afterward. Relocated from the old TOOLS-tray
// `GenerateBody`; local `strategy`/`params`/`preview` re-roll on the events
// that should change them — never in an effect.
export const RandomiseSection = ({ ink, isMobile }: Props) => {
  const { palette, genStrategy, genParams, setGenConfig, replaceAll } =
    usePalette();
  const n = Math.max(palette.length, 1);
  const roll = (s: GenStrategy, p: RampParams): string[] =>
    generatePalette(n, s, Math.random, s === "rampensau" ? p : undefined);
  const [strategy, setStrategy] = useState<GenStrategy>(genStrategy);
  const [params, setParams] = useState<RampParams>(
    genParams ?? defaultRampParams(),
  );
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
  const use = () => {
    replaceAll(preview);
    setGenConfig({
      strategy,
      params: strategy === "rampensau" ? params : null,
    });
  };
  return (
    <div>
      <div
        style={{
          fontFamily: POSTER.body,
          fontSize: 11,
          letterSpacing: "0.04em",
          opacity: 0.6,
          marginBottom: 8,
        }}
      >
        sets how the RANDOMISE button builds a fresh palette
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
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
      <div style={{ marginTop: 12, border: `2px solid ${ink}` }}>
        <div style={{ display: "flex", height: isMobile ? 64 : 48 }}>
          {preview.map((h, i) => (
            <div key={i} style={{ flex: 1, background: h }} />
          ))}
        </div>
        <div
          style={{
            padding: "8px 10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
            borderTop: `2px solid ${ink}`,
          }}
        >
          <div
            style={{
              fontFamily: POSTER.display,
              fontSize: 15,
              letterSpacing: "0.02em",
            }}
          >
            PREVIEW
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <SmallBtn
              ink={ink}
              tall={isMobile}
              onClick={() => setPreview(roll(strategy, params))}
            >
              REGEN
            </SmallBtn>
            <SmallBtn ink={ink} tall={isMobile} onClick={use}>
              USE
            </SmallBtn>
          </div>
        </div>
      </div>
    </div>
  );
};
