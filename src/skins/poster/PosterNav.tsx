import { ReactNode, useState } from "react";
import { fontColorFor } from "../../functions/contrast";
import { POSTER } from "./tokens";

// Fixed width so the right-side verb cluster reads as a uniform block.
const RIGHT_W = 168;

interface NavProps {
  ink: string;
  compact: boolean;
  onSettings: () => void;
  onTools: () => void;
  onExport: () => void;
  onRandomize: () => void;
  onMenu: () => void;
}

export const PosterNav = ({
  ink,
  compact,
  onSettings,
  onTools,
  onExport,
  onRandomize,
  onMenu,
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
      <div style={{ flex: 1, minWidth: 40 }} />
      <NavBtn
        ink={ink}
        onClick={onRandomize}
        bold
        accent
        borderLeft
        width={RIGHT_W}
      >
        RANDOMISE
      </NavBtn>
      <NavBtn ink={ink} onClick={onTools} width={RIGHT_W}>
        TOOLS
      </NavBtn>
      <NavBtn ink={ink} onClick={onExport} width={RIGHT_W}>
        EXPORT
      </NavBtn>
      <NavBtn ink={ink} onClick={onSettings} icon ariaLabel="settings">
        ⚙
      </NavBtn>
    </div>
  );
};

interface NavBtnProps {
  ink: string;
  onClick: () => void;
  children: ReactNode;
  bold?: boolean;
  accent?: boolean;
  icon?: boolean;
  borderLeft?: boolean;
  width?: number;
  ariaLabel?: string;
}

const NavBtn = ({
  ink,
  onClick,
  children,
  bold,
  accent,
  icon,
  borderLeft,
  width,
  ariaLabel,
}: NavBtnProps) => {
  const [hov, setHov] = useState(false);
  const invert = ink === POSTER.ink ? POSTER.bg : POSTER.ink;
  const edge = `${POSTER.borderW}px solid ${ink}`;
  const hoverBg = accent ? POSTER.accent : ink;
  const hoverFg = accent ? fontColorFor(POSTER.accent) : invert;
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: POSTER.body,
        fontWeight: bold ? 700 : 600,
        fontSize: icon ? 20 : 13,
        letterSpacing: icon ? 0 : "0.08em",
        textTransform: icon ? "none" : "uppercase",
        padding: "0 18px",
        width: width ?? (icon ? 60 : undefined),
        boxSizing: "border-box",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        border: "none",
        borderRight: edge,
        borderLeft: borderLeft ? edge : "none",
        background: hov ? hoverBg : "transparent",
        color: hov ? hoverFg : ink,
        cursor: "pointer",
        transition: "background .12s, color .12s",
      }}
    >
      {children}
    </button>
  );
};
