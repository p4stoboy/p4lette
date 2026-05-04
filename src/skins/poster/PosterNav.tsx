import { ReactNode, useState } from "react";
import { POSTER } from "./tokens";

interface NavProps {
  ink: string;
  bg: string;
  isDark: boolean;
  compact: boolean;
  onTheme: () => void;
  onAbout: () => void;
  onSaved: () => void;
  onHarmony: () => void;
  onExport: () => void;
  onSave: () => void;
  onRandomize: () => void;
  onAdd: () => void;
  onMenu: () => void;
  savedCount: number;
}

export const PosterNav = ({
  ink,
  isDark,
  compact,
  onTheme,
  onAbout,
  onSaved,
  onHarmony,
  onExport,
  onSave,
  onRandomize,
  onAdd,
  onMenu,
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
          fontSize: 56,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          padding: "14px 24px",
          borderRight: `${POSTER.borderW}px solid ${ink}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        P4<span style={{ color: POSTER.accent }}>★</span>LETTE
      </div>
      <NavBtn ink={ink} onClick={onAdd} bold>
        ＋ ADD
      </NavBtn>
      <NavBtn ink={ink} onClick={onRandomize}>
        ⚄ SHUFFLE
      </NavBtn>
      <NavBtn ink={ink} onClick={onSave}>
        ♥ SAVE
      </NavBtn>
      <NavBtn ink={ink} onClick={onSaved}>
        VAULT [{savedCount}]
      </NavBtn>
      <NavBtn ink={ink} onClick={onHarmony}>
        HARMONY
      </NavBtn>
      <NavBtn ink={ink} onClick={onExport}>
        EXPORT
      </NavBtn>
      <div style={{ flex: 1 }} />
      <NavBtn ink={ink} onClick={onAbout}>
        ABOUT
      </NavBtn>
      <NavBtn ink={ink} onClick={onTheme}>
        {isDark ? "☀" : "☾"} {isDark ? "LIGHT" : "DARK"}
      </NavBtn>
    </div>
  );
};

interface NavBtnProps {
  ink: string;
  onClick: () => void;
  children: ReactNode;
  bold?: boolean;
}

const NavBtn = ({ ink, onClick, children, bold }: NavBtnProps) => {
  const [hov, setHov] = useState(false);
  const invert = ink === POSTER.ink ? POSTER.bg : POSTER.ink;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: POSTER.body,
        fontWeight: bold ? 700 : 600,
        fontSize: 13,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "0 18px",
        border: "none",
        borderRight: `${POSTER.borderW}px solid ${ink}`,
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
