import { ReactNode, useState } from "react";
import { Backdrop, SmallBtn } from "./Backdrop";
import { Palette } from "../../types/Palette";
import { HarmonyKind, harmony, harmonyRyb } from "../../functions/harmony";

type Wheel = "oklch" | "ryb";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
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
  isMobile,
  palette,
  onClose,
  onApply,
}: Props) => {
  const baseHex = palette[0]?.hex ?? "#ff3d00";
  const [base, setBase] = useState(baseHex);
  const [wheel, setWheel] = useState<Wheel>("oklch");

  return (
    <Backdrop onClose={onClose} align={isMobile ? "bottom" : "right"}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: bg,
          color: ink,
          borderLeft: isMobile ? "none" : `${POSTER.borderW}px solid ${ink}`,
          borderTop: isMobile ? `${POSTER.borderW}px solid ${ink}` : "none",
          width: isMobile ? "100%" : 520,
          height: isMobile ? "auto" : "100%",
          maxWidth: isMobile ? "100vw" : "94vw",
          maxHeight: isMobile ? "88vh" : "100%",
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
            aria-label="close"
            style={{
              background: "none",
              border: isMobile ? `2px solid ${ink}` : "none",
              fontSize: 22,
              cursor: "pointer",
              color: ink,
              width: isMobile ? 44 : undefined,
              height: isMobile ? 44 : undefined,
              touchAction: "manipulation",
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
                flexShrink: 0,
              }}
            />
            <input
              value={base}
              onChange={(e) => setBase(e.target.value)}
              style={{
                fontFamily: POSTER.mono,
                fontSize: 14,
                padding: isMobile ? "10px 12px" : "6px 10px",
                border: `2px solid ${ink}`,
                background: "transparent",
                color: ink,
                flex: 1,
                outline: "none",
                minHeight: isMobile ? 44 : undefined,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            {palette.map((c) => (
              <button
                key={c.dataId}
                onClick={() => setBase(c.hex)}
                aria-label={`use ${c.hex}`}
                style={{
                  flex: 1,
                  height: isMobile ? 44 : 24,
                  background: c.hex,
                  border:
                    base === c.hex
                      ? `2px solid ${ink}`
                      : "2px solid transparent",
                  cursor: "pointer",
                  touchAction: "manipulation",
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 12,
              border: `2px solid ${ink}`,
            }}
          >
            <WheelTab
              ink={ink}
              active={wheel === "oklch"}
              tall={isMobile}
              divide
              onClick={() => setWheel("oklch")}
            >
              OKLCH
            </WheelTab>
            <WheelTab
              ink={ink}
              active={wheel === "ryb"}
              tall={isMobile}
              onClick={() => setWheel("ryb")}
            >
              RYB · ITTEN
            </WheelTab>
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          {HARMONIES.map(([label, kind]) => {
            const colors =
              wheel === "ryb" ? harmonyRyb(base, kind) : harmony(base, kind);
            return (
              <div
                key={kind}
                style={{ marginBottom: 14, border: `2px solid ${ink}` }}
              >
                <div style={{ display: "flex", height: isMobile ? 76 : 56 }}>
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
                  <SmallBtn
                    ink={ink}
                    tall={isMobile}
                    onClick={() => onApply(colors)}
                  >
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

interface WheelTabProps {
  ink: string;
  active: boolean;
  tall: boolean;
  divide?: boolean;
  onClick: () => void;
  children: ReactNode;
}

const WheelTab = ({
  ink,
  active,
  tall,
  divide,
  onClick,
  children,
}: WheelTabProps) => {
  const invert = ink === POSTER.ink ? POSTER.bg : POSTER.ink;
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: tall ? "12px 14px" : "8px 12px",
        minHeight: tall ? 44 : undefined,
        fontFamily: POSTER.body,
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        border: "none",
        borderRight: divide ? `2px solid ${ink}` : "none",
        background: active ? ink : "transparent",
        color: active ? invert : ink,
        cursor: "pointer",
        touchAction: "manipulation",
      }}
    >
      {children}
    </button>
  );
};
