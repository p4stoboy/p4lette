import { ReactNode, useState } from "react";
import { TERMINAL } from "./tokens";

interface MenuProps {
  ink: string;
  bg: string;
  accent: string;
  isDark: boolean;
  savedCount: number;
  nameList: string;
  onClose: () => void;
  onTheme: () => void;
  onAdd: () => void;
  onShuffle: () => void;
  onSave: () => void;
  onVault: () => void;
  onHarmony: () => void;
  onExport: () => void;
  onAbout: () => void;
  onNaming: () => void;
  onSwapSkin: () => void;
}

export const TerminalMobileMenu = ({
  ink,
  bg,
  accent,
  isDark,
  savedCount,
  nameList,
  onClose,
  onTheme,
  onAdd,
  onShuffle,
  onSave,
  onVault,
  onHarmony,
  onExport,
  onAbout,
  onNaming,
  onSwapSkin,
}: MenuProps) => {
  const fire = (fn: () => void) => () => {
    fn();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label="menu"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 60,
        display: "flex",
        alignItems: "flex-end",
        animation: "termMenuFade .15s ease",
      }}
    >
      <style>{`@keyframes termMenuFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes termMenuSlide { from { transform: translateY(8%); } to { transform: translateY(0); } }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxHeight: "82vh",
          background: bg,
          color: ink,
          borderTop: `${TERMINAL.borderW}px solid ${ink}`,
          fontFamily: TERMINAL.mono,
          display: "flex",
          flexDirection: "column",
          animation: "termMenuSlide .18s steps(4)",
        }}
      >
        <div
          style={{
            padding: "12px 14px",
            borderBottom: `1px dashed ${ink}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12,
            letterSpacing: "0.14em",
            fontWeight: 700,
          }}
        >
          <span>
            <span style={{ color: accent }}>p4lette</span> $ menu_
          </span>
          <button
            aria-label="close menu"
            onClick={onClose}
            style={{
              width: 44,
              height: 44,
              background: "transparent",
              border: `${TERMINAL.borderW}px solid ${ink}`,
              color: ink,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: TERMINAL.mono,
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            [X]
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Cmd
            ink={ink}
            accent={accent}
            k="a"
            label="add color"
            onClick={fire(onAdd)}
          />
          <Cmd
            ink={ink}
            accent={accent}
            k="s"
            label="shuffle unlocked"
            onClick={fire(onShuffle)}
          />
          <Cmd
            ink={ink}
            accent={accent}
            k="w"
            label="save palette"
            onClick={fire(onSave)}
          />
          <Cmd
            ink={ink}
            accent={accent}
            k="v"
            label={`vault (${savedCount})`}
            onClick={fire(onVault)}
          />
          <Cmd
            ink={ink}
            accent={accent}
            k="h"
            label="harmony"
            onClick={fire(onHarmony)}
          />
          <Cmd
            ink={ink}
            accent={accent}
            k="e"
            label="export"
            onClick={fire(onExport)}
          />
          <Cmd
            ink={ink}
            accent={accent}
            k="n"
            label={`names (${nameList})`}
            onClick={fire(onNaming)}
          />
          <Cmd
            ink={ink}
            accent={accent}
            k="?"
            label="about"
            onClick={fire(onAbout)}
          />
          <Cmd
            ink={ink}
            accent={accent}
            k="d"
            label={isDark ? "light mode" : "dark mode"}
            onClick={fire(onTheme)}
          />
          <Cmd
            ink={ink}
            accent={accent}
            k="t"
            label="poster skin"
            onClick={fire(onSwapSkin)}
          />
        </div>
      </div>
    </div>
  );
};

interface CmdProps {
  ink: string;
  accent: string;
  k: string;
  label: ReactNode;
  onClick: () => void;
}

const Cmd = ({ ink, accent, k, label, onClick }: CmdProps) => {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        minHeight: 56,
        border: "none",
        borderBottom: `1px dashed ${ink}`,
        background: pressed ? accent : "transparent",
        color: pressed ? "#000" : ink,
        cursor: "pointer",
        fontFamily: TERMINAL.mono,
        fontSize: 16,
        letterSpacing: "0.08em",
        textAlign: "left",
        touchAction: "manipulation",
      }}
    >
      <span
        style={{
          fontWeight: 700,
          color: pressed ? "#000" : accent,
          minWidth: 28,
          textAlign: "center",
          padding: "2px 6px",
          border: `1px solid ${pressed ? "#000" : ink}`,
        }}
      >
        {k}
      </span>
      <span style={{ fontWeight: 600 }}>{label}</span>
    </button>
  );
};
