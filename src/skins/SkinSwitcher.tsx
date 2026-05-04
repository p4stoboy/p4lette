import { CSSProperties, ReactNode, useState } from "react";

export type Skin = "poster" | "terminal";

interface Props {
  skin: Skin;
  setSkin: (s: Skin) => void;
}

const POSTER_INK = "#0E0B08";
const POSTER_BG = "#FFF8E7";
const POSTER_ACCENT = "#FF3D00";
const TERM_INK = "#E8E5DD";
const TERM_BG = "#0A0A0A";
const TERM_ACCENT = "#00FF6A";

export const SkinSwitcher = ({ skin, setSkin }: Props) => {
  const isPoster = skin === "poster";

  const wrapStyle: CSSProperties = isPoster
    ? {
        position: "fixed",
        bottom: 18,
        right: 18,
        zIndex: 9999,
        background: POSTER_BG,
        border: `3px solid ${POSTER_INK}`,
        boxShadow: `4px 4px 0 ${POSTER_ACCENT}`,
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
        fontFamily: '"Anton", "Bebas Neue", Impact, sans-serif',
      }
    : {
        position: "fixed",
        bottom: 14,
        right: 14,
        zIndex: 9999,
        background: TERM_BG,
        border: `1px solid ${TERM_INK}`,
        boxShadow: `3px 3px 0 ${TERM_ACCENT}`,
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
        fontFamily: '"JetBrains Mono", Menlo, monospace',
      };

  const labelStyle: CSSProperties = isPoster
    ? {
        padding: "6px 12px",
        fontSize: 11,
        letterSpacing: "0.14em",
        color: POSTER_INK,
        background: POSTER_BG,
        borderRight: `3px solid ${POSTER_INK}`,
        fontWeight: 700,
        fontFamily: '"Space Grotesk", Inter, sans-serif',
        display: "flex",
        alignItems: "center",
        textTransform: "uppercase",
      }
    : {
        padding: "4px 10px",
        fontSize: 10,
        letterSpacing: "0.16em",
        color: TERM_INK,
        background: TERM_BG,
        borderRight: `1px solid ${TERM_INK}`,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
      };

  const hotkeyStyle: CSSProperties = isPoster
    ? {
        padding: "6px 10px",
        fontSize: 10,
        letterSpacing: "0.14em",
        color: POSTER_INK,
        background: POSTER_BG,
        borderLeft: `3px solid ${POSTER_INK}`,
        fontFamily: '"Space Grotesk", Inter, sans-serif',
        opacity: 0.5,
        display: "flex",
        alignItems: "center",
        textTransform: "uppercase",
      }
    : {
        padding: "4px 8px",
        fontSize: 10,
        letterSpacing: "0.14em",
        color: TERM_INK,
        background: TERM_BG,
        borderLeft: `1px solid ${TERM_INK}`,
        opacity: 0.5,
        display: "flex",
        alignItems: "center",
      };

  return (
    <div style={wrapStyle}>
      <div style={labelStyle}>{isPoster ? "◆ SKIN" : "// SKIN"}</div>
      <SkinBtn
        isPoster={isPoster}
        active={isPoster}
        onClick={() => setSkin("poster")}
      >
        {isPoster ? "POSTER" : "[A] POSTER"}
      </SkinBtn>
      <SkinBtn
        isPoster={isPoster}
        active={!isPoster}
        onClick={() => setSkin("terminal")}
      >
        {isPoster ? "TERMINAL" : "[B] TERMINAL"}
      </SkinBtn>
      <div style={hotkeyStyle}>T</div>
    </div>
  );
};

interface BtnProps {
  isPoster: boolean;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

const SkinBtn = ({ isPoster, active, onClick, children }: BtnProps) => {
  const [hov, setHov] = useState(false);
  const baseStyle: CSSProperties = isPoster
    ? {
        padding: "8px 16px",
        border: "none",
        borderRight: `3px solid ${POSTER_INK}`,
        fontFamily: '"Anton", Impact, sans-serif',
        fontSize: 18,
        letterSpacing: "0.04em",
        cursor: "pointer",
        textTransform: "uppercase",
        transition: "background .12s, color .12s",
        background: active ? POSTER_INK : hov ? POSTER_ACCENT : POSTER_BG,
        color: active ? POSTER_BG : hov ? POSTER_BG : POSTER_INK,
      }
    : {
        padding: "4px 12px",
        border: "none",
        borderRight: `1px solid ${TERM_INK}`,
        fontFamily: '"JetBrains Mono", Menlo, monospace',
        fontSize: 11,
        letterSpacing: "0.12em",
        fontWeight: 700,
        cursor: "pointer",
        transition: "background .1s, color .1s",
        background: active ? TERM_ACCENT : hov ? "#1a1a1a" : TERM_BG,
        color: active ? "#000" : TERM_INK,
      };
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={baseStyle}
    >
      {children}
    </button>
  );
};
