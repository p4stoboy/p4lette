import { useState } from "react";
import { BrutBackdrop, BrutSmallBtn } from "./BrutBackdrop";
import { Palette } from "../../types/Palette";
import { HarmonyKind, harmony } from "../../functions/harmony";
import { TERMINAL } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  accent: string;
  palette: Palette;
  onClose: () => void;
  onApply: (hexes: string[]) => void;
}

const HARMONIES: ReadonlyArray<readonly [string, HarmonyKind]> = [
  ["ANALOGOUS", "analogous"],
  ["COMPLEMENT", "complementary"],
  ["TRIADIC", "triadic"],
  ["TETRADIC", "tetradic"],
  ["SPLIT-COMP", "split"],
  ["MONO", "monochrome"],
  ["SHADES", "shades"],
];

export const TerminalHarmonyDrawer = ({
  ink,
  bg,
  accent,
  palette,
  onClose,
  onApply,
}: Props) => {
  const [base, setBase] = useState(palette[0]?.hex ?? "#00ff6a");
  return (
    <BrutBackdrop onClose={onClose} align="right">
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: bg,
          color: ink,
          borderLeft: `${TERMINAL.borderW}px solid ${ink}`,
          width: 480,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "6px 14px",
            borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
            background: ink,
            color: bg,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em" }}
          >
            // HARMONY.SEED
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: bg,
              cursor: "pointer",
              fontFamily: TERMINAL.mono,
              fontSize: 14,
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            padding: 14,
            borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              marginBottom: 6,
            }}
          >
            BASE_
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                width: 30,
                height: 30,
                background: base,
                border: `${TERMINAL.borderW}px solid ${ink}`,
              }}
            />
            <input
              value={base}
              onChange={(e) => setBase(e.target.value)}
              style={{
                fontFamily: TERMINAL.mono,
                fontSize: 13,
                padding: "4px 8px",
                border: `${TERMINAL.borderW}px solid ${ink}`,
                background: "transparent",
                color: ink,
                flex: 1,
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
            {palette.map((c) => (
              <button
                key={c.dataId}
                onClick={() => setBase(c.hex)}
                style={{
                  flex: 1,
                  height: 20,
                  background: c.hex,
                  border: `${TERMINAL.borderW}px solid ${
                    base === c.hex ? accent : ink
                  }`,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
          {HARMONIES.map(([label, kind]) => {
            const colors = harmony(base, kind);
            return (
              <div
                key={kind}
                style={{
                  marginBottom: 10,
                  border: `${TERMINAL.borderW}px solid ${ink}`,
                }}
              >
                <div style={{ display: "flex", height: 40 }}>
                  {colors.map((h, i) => (
                    <div key={i} style={{ flex: 1, background: h }} />
                  ))}
                </div>
                <div
                  style={{
                    padding: "6px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: `${TERMINAL.borderW}px solid ${ink}`,
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    fontWeight: 700,
                  }}
                >
                  <span>{label}</span>
                  <BrutSmallBtn
                    ink={ink}
                    accent={accent}
                    onClick={() => onApply(colors)}
                  >
                    APPLY
                  </BrutSmallBtn>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </BrutBackdrop>
  );
};
