import { ReactNode, useState } from "react";
import { POSTER } from "./tokens";

// Fixed widths so each nav cluster reads as a uniform block: the three
// left-side toggles share LEFT_W, the right-side actions share RIGHT_W.
const LEFT_W = 124;
const RIGHT_W = 172;

interface NavProps {
  ink: string;
  bg: string;
  isDark: boolean;
  compact: boolean;
  tickerVisible: boolean;
  onTheme: () => void;
  onAbout: () => void;
  onSaved: () => void;
  onTools: () => void;
  onExport: () => void;
  onRandomize: () => void;
  onAdd: () => void;
  onMenu: () => void;
  onToggleTicker: () => void;
  savedCount: number;
}

export const PosterNav = ({
  ink,
  isDark,
  compact,
  tickerVisible,
  onTheme,
  onAbout,
  onSaved,
  onTools,
  onExport,
  onRandomize,
  onAdd,
  onMenu,
  onToggleTicker,
  savedCount,
}: NavProps) => {
  if (compact) {
    return (
      <div
        style={{
          borderBottom: `${POSTER.borderW}px solid ${ink}`,
          display: "flex",
          alignItems: "stretch",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            fontFamily: POSTER.display,
            fontSize: 36,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          P4<span style={{ color: POSTER.accent }}>★</span>LETTE
        </div>
        <button
          aria-label="open menu"
          onClick={onMenu}
          style={{
            fontFamily: POSTER.body,
            fontWeight: 700,
            fontSize: 26,
            padding: "0 18px",
            border: "none",
            borderLeft: `${POSTER.borderW}px solid ${ink}`,
            background: "transparent",
            color: ink,
            cursor: "pointer",
            minWidth: 60,
            touchAction: "manipulation",
          }}
        >
          ≡
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        borderBottom: `${POSTER.borderW}px solid ${ink}`,
        display: "flex",
        alignItems: "stretch",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontFamily: POSTER.display,
          fontSize: 40,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          padding: "9px 24px",
          borderRight: `${POSTER.borderW}px solid ${ink}`,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        P4<span style={{ color: POSTER.accent }}>★</span>LETTE
      </div>
      <NavBtn ink={ink} onClick={onTheme} width={LEFT_W}>
        {isDark ? "☀" : "☾"} {isDark ? "LIGHT" : "DARK"}
      </NavBtn>
      <NavBtn ink={ink} onClick={onAbout} width={LEFT_W}>
        ABOUT
      </NavBtn>
      <NavBtn ink={ink} onClick={onToggleTicker} width={LEFT_W}>
        {tickerVisible ? "▼" : "▶"} TICKER
      </NavBtn>
      <div style={{ flex: 1, minWidth: 40 }} />
      <NavBtn ink={ink} onClick={onAdd} bold large borderLeft width={RIGHT_W}>
        ＋ ADD COLOR
      </NavBtn>
      <NavBtn ink={ink} onClick={onRandomize} width={RIGHT_W}>
        SHUFFLE
      </NavBtn>
      <NavBtn ink={ink} onClick={onTools} width={RIGHT_W}>
        TOOLS
      </NavBtn>
      <NavBtn ink={ink} onClick={onSaved} width={RIGHT_W}>
        SAVE / LOAD [{savedCount}]
      </NavBtn>
      <NavBtn ink={ink} onClick={onExport} width={RIGHT_W}>
        EXPORT
      </NavBtn>
    </div>
  );
};

interface NavBtnProps {
  ink: string;
  onClick: () => void;
  children: ReactNode;
  bold?: boolean;
  large?: boolean;
  borderLeft?: boolean;
  width?: number;
}

const NavBtn = ({
  ink,
  onClick,
  children,
  bold,
  large,
  borderLeft,
  width,
}: NavBtnProps) => {
  const [hov, setHov] = useState(false);
  const invert = ink === POSTER.ink ? POSTER.bg : POSTER.ink;
  const edge = `${POSTER.borderW}px solid ${ink}`;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: POSTER.body,
        fontWeight: bold ? 700 : 600,
        fontSize: large ? 16 : 13,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "0 18px",
        width,
        boxSizing: "border-box",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        border: "none",
        borderRight: edge,
        borderLeft: borderLeft ? edge : "none",
        background: hov ? ink : "transparent",
        color: hov ? invert : ink,
        cursor: "pointer",
        transition: "background .12s, color .12s",
      }}
    >
      {children}
    </button>
  );
};
