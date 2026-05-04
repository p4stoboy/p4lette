import { useState } from "react";
import { Backdrop, SmallBtn } from "./Backdrop";
import { Palette } from "../../types/Palette";
import { HarmonyKind, harmony } from "../../functions/harmony";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  palette: Palette;
  onClose: () => void;
  onApply: (hexes: string[]) => void;
}

const HARMONIES: ReadonlyArray<readonly [string, HarmonyKind]> = [
  ["ANALOGOUS", "analogous"],
  ["COMPLEMENTARY", "complementary"],
  ["TRIADIC", "triadic"],
  ["TETRADIC", "tetradic"],
  ["SPLIT-COMP", "split"],
  ["MONOCHROME", "monochrome"],
  ["SHADES", "shades"],
];

export const PosterHarmonyDrawer = ({
  ink,
  bg,
  palette,
  onClose,
  onApply,
}: Props) => {
  const baseHex = palette[0]?.hex ?? "#ff3d00";
  const [base, setBase] = useState(baseHex);

  return (
    <Backdrop onClose={onClose} align="right">
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: bg,
          color: ink,
          borderLeft: `${POSTER.borderW}px solid ${ink}`,
          width: 520,
          height: "100%",
          maxWidth: "94vw",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            borderBottom: `${POSTER.borderW}px solid ${ink}`,
            padding: "16px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ fontFamily: POSTER.display, fontSize: 28 }}>
            HARMONY
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
              color: ink,
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            padding: "14px 22px",
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
            BASE COLOR
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: base,
                border: `2px solid ${ink}`,
              }}
            />
            <input
              value={base}
              onChange={(e) => setBase(e.target.value)}
              style={{
                fontFamily: POSTER.mono,
                fontSize: 14,
                padding: "6px 10px",
                border: `2px solid ${ink}`,
                background: "transparent",
                color: ink,
                flex: 1,
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {palette.map((c) => (
              <button
                key={c.dataId}
                onClick={() => setBase(c.hex)}
                style={{
                  flex: 1,
                  height: 24,
                  background: c.hex,
                  border:
                    base === c.hex
                      ? `2px solid ${ink}`
                      : "2px solid transparent",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          {HARMONIES.map(([label, kind]) => {
            const colors = harmony(base, kind);
            return (
              <div
                key={kind}
                style={{ marginBottom: 14, border: `2px solid ${ink}` }}
              >
                <div style={{ display: "flex", height: 56 }}>
                  {colors.map((h, i) => (
                    <div key={i} style={{ flex: 1, background: h }} />
                  ))}
                </div>
                <div
                  style={{
                    padding: "10px 12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: `2px solid ${ink}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: POSTER.display,
                      fontSize: 16,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {label}
                  </div>
                  <SmallBtn ink={ink} onClick={() => onApply(colors)}>
                    USE
                  </SmallBtn>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Backdrop>
  );
};
