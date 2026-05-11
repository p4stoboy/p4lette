import { ReactNode, useState } from "react";
import { POSTER } from "./tokens";

interface MenuProps {
  ink: string;
  bg: string;
  isDark: boolean;
  savedCount: number;
  nameList: string;
  onClose: () => void;
  onTheme: () => void;
  onAdd: () => void;
  onRandomize: () => void;
  onSave: () => void;
  onSaved: () => void;
  onHarmony: () => void;
  onExport: () => void;
  onAbout: () => void;
  onNaming: () => void;
}

export const PosterMobileMenu = ({
  ink,
  bg,
  isDark,
  savedCount,
  nameList,
  onClose,
  onTheme,
  onAdd,
  onRandomize,
  onSave,
  onSaved,
  onHarmony,
  onExport,
  onAbout,
  onNaming,
}: MenuProps) => {
  const fire = (fn: () => void) => () => {
    fn();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label="menu"
      style={{
        position: "fixed",
        inset: 0,
        background: bg,
        color: ink,
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        animation: "menuIn .2s ease",
      }}
    >
      <style>{`@keyframes menuIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 18px 14px",
          borderBottom: `${POSTER.borderW}px solid ${ink}`,
        }}
      >
        <div
          style={{
            fontFamily: POSTER.display,
            fontSize: 44,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          P4<span style={{ color: POSTER.accent }}>★</span>LETTE
        </div>
        <button
          aria-label="close menu"
          onClick={onClose}
          style={{
            width: 48,
            height: 48,
            background: "transparent",
            border: `${POSTER.borderW}px solid ${ink}`,
            color: ink,
            fontSize: 24,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: POSTER.body,
            touchAction: "manipulation",
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <Row ink={ink} onClick={fire(onAdd)} bold>
          ＋ ADD COLOR
        </Row>
        <Row ink={ink} onClick={fire(onRandomize)}>
          ⚄ SHUFFLE UNLOCKED
        </Row>
        <Row ink={ink} onClick={fire(onSave)}>
          ♥ SAVE PALETTE
        </Row>
        <Row ink={ink} onClick={fire(onSaved)}>
          VAULT [{savedCount}]
        </Row>
        <Row ink={ink} onClick={fire(onHarmony)}>
          HARMONY
        </Row>
        <Row ink={ink} onClick={fire(onExport)}>
          EXPORT
        </Row>
        <Row ink={ink} onClick={fire(onNaming)}>
          NAMES · {nameList}
        </Row>
        <Row ink={ink} onClick={fire(onAbout)}>
          ABOUT
        </Row>
        <Row ink={ink} onClick={fire(onTheme)}>
          {isDark ? "LIGHT MODE" : "DARK MODE"}
        </Row>
      </div>
    </div>
  );
};

interface RowProps {
  ink: string;
  onClick: () => void;
  children: ReactNode;
  bold?: boolean;
}

const Row = ({ ink, onClick, children, bold }: RowProps) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        fontFamily: POSTER.display,
        fontSize: 32,
        lineHeight: 1,
        letterSpacing: "-0.01em",
        textTransform: "uppercase",
        textAlign: "left",
        padding: "20px 24px",
        minHeight: 64,
        border: "none",
        borderBottom: `1px solid ${ink}`,
        background: pressed ? ink : "transparent",
        color: pressed ? (ink === POSTER.ink ? POSTER.bg : POSTER.ink) : ink,
        cursor: "pointer",
        fontWeight: bold ? 700 : 400,
        touchAction: "manipulation",
      }}
    >
      {children}
    </button>
  );
};
