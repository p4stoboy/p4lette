import { useState } from "react";
import {
  HARMONY_HSV_KINDS,
  HARMONY_STYLES,
  HarmonyKind,
  PaletteStyle,
  RYB_CUBES,
  harmony,
  harmonyHsv,
  harmonyRyb,
} from "../../../functions/harmony";
import { POSTER } from "../tokens";
import { BasePicker, SwatchRow, Toggle } from "./shared";
import { BodyProps, rowsStyle } from "./styles";

type HarmonySpace = "oklch" | "ryb" | "hsv";

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
  ["ryb", "RYB"],
  ["hsv", "HSV"],
];

export const HarmonyBody = ({ ink, isMobile, palette, onApply }: BodyProps) => {
  const [base, setBase] = useState(palette[0]?.hex ?? "#ff3d00");
  const [space, setSpace] = useState<HarmonySpace>("oklch");
  const [style, setStyle] = useState<PaletteStyle>("default");
  const [cube, setCube] = useState("itten");
  // Variant picker: styles for OKLCH, pigment cubes for RYB, nothing for HSV.
  const variants =
    space === "oklch"
      ? HARMONY_STYLES.map((s) => ({
          key: s,
          label: s,
          active: style === s,
          pick: () => setStyle(s),
        }))
      : space === "ryb"
        ? RYB_CUBES.map((c) => ({
            key: c.key,
            label: c.label,
            active: cube === c.key,
            pick: () => setCube(c.key),
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
          colors:
            space === "ryb"
              ? harmonyRyb(base, kind, cube)
              : harmony(base, kind, style),
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
        <div style={{ marginTop: 12, border: `2px solid ${ink}` }}>
          <div style={{ display: "flex" }}>
            {SPACES.map(([key, label], i) => (
              <Toggle
                key={key}
                ink={ink}
                active={space === key}
                tall={isMobile}
                divide={i < SPACES.length - 1}
                onClick={() => setSpace(key)}
              >
                {label}
              </Toggle>
            ))}
          </div>
          {variants.length > 0 && (
            <div style={{ display: "flex", borderTop: `2px solid ${ink}` }}>
              {variants.map((v, i) => (
                <Toggle
                  key={v.key}
                  ink={ink}
                  active={v.active}
                  tall={isMobile}
                  divide={i < variants.length - 1}
                  onClick={v.pick}
                >
                  {v.label}
                </Toggle>
              ))}
            </div>
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
