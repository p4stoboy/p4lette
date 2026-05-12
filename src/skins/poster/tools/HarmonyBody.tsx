import { useState } from "react";
import {
  HARMONY_HSV_KINDS,
  HARMONY_STYLES,
  HarmonyKind,
  PaletteStyle,
  harmony,
  harmonyHsv,
} from "../../../functions/harmony";
import { POSTER } from "../tokens";
import { BasePicker, SwatchRow, Toggle } from "./shared";
import {
  BodyProps,
  rowsStyle,
  pillRowStyle,
  pillRowLabelStyle,
} from "./styles";

type HarmonySpace = "oklch" | "hsv";

const HARMONIES: ReadonlyArray<readonly [string, HarmonyKind]> = [
  ["ANALOGOUS", "analogous"],
  ["COMPLEMENTARY", "complementary"],
  ["TRIADIC", "triadic"],
  ["TETRADIC", "tetradic"],
  ["SPLIT-COMP", "split"],
  ["MONOCHROME", "monochrome"],
  ["SHADES", "shades"],
];

const SPACES: ReadonlyArray<readonly [HarmonySpace, string]> = [
  ["oklch", "OKLCH"],
  ["hsv", "HSV"],
];

export const HarmonyBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const [base, setBase] = useState(palette[0]?.hex ?? "#ff3d00");
  const [space, setSpace] = useState<HarmonySpace>("oklch");
  const [style, setStyle] = useState<PaletteStyle>("default");
  // Variant picker: the pro-color-harmonies geometric styles for OKLCH; the
  // HSV harmonies have no variant.
  const variants =
    space === "oklch"
      ? HARMONY_STYLES.map((s) => ({
          key: s,
          label: s,
          active: style === s,
          pick: () => setStyle(s),
        }))
      : [];
  const rows =
    space === "hsv"
      ? HARMONY_HSV_KINDS.map((k) => ({
          key: k.key,
          label: k.label,
          colors: harmonyHsv(base, k.key),
        }))
      : HARMONIES.map(([label, kind]) => ({
          key: kind,
          label,
          colors: harmony(base, kind, style),
        }));
  return (
    <>
      <BasePicker
        ink={ink}
        isMobile={isMobile}
        palette={palette}
        label="BASE COLOR"
        value={base}
        onChange={setBase}
      >
        <div style={{ marginTop: 12 }}>
          <div style={pillRowLabelStyle()}>SPACE</div>
          <div style={pillRowStyle()}>
            {SPACES.map(([key, label]) => (
              <Toggle
                key={key}
                ink={ink}
                active={space === key}
                tall={isMobile}
                onClick={() => setSpace(key)}
              >
                {label}
              </Toggle>
            ))}
          </div>
          {variants.length > 0 && (
            <>
              <div style={{ ...pillRowLabelStyle(), marginTop: 10 }}>STYLE</div>
              <div style={pillRowStyle()}>
                {variants.map((v) => (
                  <Toggle
                    key={v.key}
                    ink={ink}
                    active={v.active}
                    tall={isMobile}
                    onClick={v.pick}
                  >
                    {v.label}
                  </Toggle>
                ))}
              </div>
            </>
          )}
        </div>
      </BasePicker>
      <div style={rowsStyle()}>
        {rows.map((r) => (
          <SwatchRow
            key={r.key}
            ink={ink}
            isMobile={isMobile}
            colors={r.colors}
            swatchHeight={isMobile ? 76 : 56}
            onUse={() => onApply(r.colors)}
          >
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 16,
                letterSpacing: "0.02em",
              }}
            >
              {r.label}
            </div>
          </SwatchRow>
        ))}
      </div>
    </>
  );
};
