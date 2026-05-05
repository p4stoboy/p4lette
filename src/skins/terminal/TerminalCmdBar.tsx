import { ReactNode, useState } from "react";
import { Palette } from "../../types/Palette";
import { luminance } from "../../functions/contrast";
import { TERMINAL } from "./tokens";

interface CmdBarProps {
  ink: string;
  accent: string;
  isDark: boolean;
  compact: boolean;
  palette: Palette;
  savedCount: number;
  clock: Date;
  onTheme: () => void;
  onAdd: () => void;
  onShuffle: () => void;
  onSave: () => void;
  onVault: () => void;
  onHarmony: () => void;
  onExport: () => void;
  onAbout: () => void;
  onMenu: () => void;
  onSwapSkin: () => void;
}

export const TerminalCmdBar = ({
  ink,
  accent,
  isDark,
  compact,
  palette,
  savedCount,
  clock,
  onTheme,
  onAdd,
  onShuffle,
  onSave,
  onVault,
  onHarmony,
  onExport,
  onAbout,
  onMenu,
  onSwapSkin,
}: CmdBarProps) => {
  if (compact) {
    return (
      <div
        style={{
          borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
          display: "flex",
          alignItems: "stretch",
          flexShrink: 0,
          height: 48,
          fontFamily: TERMINAL.mono,
        }}
      >
        <button
          onClick={onMenu}
          aria-label="open menu"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 14px",
            border: "none",
            background: "transparent",
            color: ink,
            cursor: "pointer",
            fontFamily: TERMINAL.mono,
            fontSize: 14,
            letterSpacing: "0.12em",
            fontWeight: 700,
            textAlign: "left",
            touchAction: "manipulation",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              background: accent,
              flexShrink: 0,
            }}
          />
          <span style={{ color: accent }}>p4lette</span>
          <span>$ menu_</span>
          <span style={{ marginLeft: "auto", opacity: 0.6, fontSize: 12 }}>
            [{palette.length}]
          </span>
        </button>
      </div>
    );
  }

  const ts = clock.toTimeString().slice(0, 8);
  const dt = clock.toISOString().slice(0, 10);
  return (
    <>
      <div
        style={{
          borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
          display: "flex",
          alignItems: "stretch",
          flexShrink: 0,
          height: 32,
        }}
      >
        <div
          style={{
            padding: "0 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderRight: `${TERMINAL.borderW}px solid ${ink}`,
            fontWeight: 700,
            letterSpacing: "0.1em",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              background: accent,
            }}
          />
          P4LETTE.EXE
        </div>
        <TopMeta ink={ink}>v0.1.0</TopMeta>
        <TopMeta ink={ink}>
          {dt} {ts}
        </TopMeta>
        <TopMeta ink={ink}>
          PID:{palette.length} · MEM:{palette.length * 16}b
        </TopMeta>
        <div style={{ flex: 1 }} />
        <div
          style={{
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            borderLeft: `${TERMINAL.borderW}px solid ${ink}`,
            gap: 8,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              background: "#22c55e",
              borderRadius: 3,
            }}
          />
          ONLINE
        </div>
        <button
          onClick={onTheme}
          style={{
            fontFamily: TERMINAL.mono,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.1em",
            padding: "0 14px",
            border: "none",
            borderLeft: `${TERMINAL.borderW}px solid ${ink}`,
            background: "transparent",
            color: ink,
            cursor: "pointer",
          }}
        >
          {isDark ? "[ LIGHT ]" : "[ DARK ]"}
        </button>
      </div>

      <div
        style={{
          borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
          display: "flex",
          alignItems: "stretch",
          flexShrink: 0,
          height: 36,
        }}
      >
        <CmdKey ink={ink} accent={accent} k="A" label="ADD" onClick={onAdd} />
        <CmdKey
          ink={ink}
          accent={accent}
          k="S"
          label="SHUFFLE"
          onClick={onShuffle}
        />
        <CmdKey ink={ink} accent={accent} k="W" label="SAVE" onClick={onSave} />
        <CmdKey
          ink={ink}
          accent={accent}
          k="V"
          label="VAULT"
          onClick={onVault}
          count={savedCount}
        />
        <CmdKey
          ink={ink}
          accent={accent}
          k="H"
          label="HARMONY"
          onClick={onHarmony}
        />
        <CmdKey
          ink={ink}
          accent={accent}
          k="E"
          label="EXPORT"
          onClick={onExport}
        />
        <div style={{ flex: 1 }} />
        <CmdKey
          ink={ink}
          accent={accent}
          k="?"
          label="ABOUT"
          onClick={onAbout}
        />
        <CmdKey
          ink={ink}
          accent={accent}
          k="T"
          label="POSTER"
          onClick={onSwapSkin}
        />
      </div>

      <div
        style={{
          borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
          display: "flex",
          flexShrink: 0,
          fontSize: 10,
          letterSpacing: "0.16em",
        }}
      >
        {palette.map((c, i) => (
          <div
            key={c.dataId}
            style={{
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              padding: "4px 10px",
              borderRight:
                i < palette.length - 1
                  ? `${TERMINAL.borderW}px solid ${ink}`
                  : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ opacity: 0.6, overflow: "hidden", minWidth: 0 }}>
              COL.{String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ opacity: 0.6, flexShrink: 0 }}>
              {c.locked ? "[LOCK]" : `[${luminance(c.hex).toFixed(2)}L]`}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

const TopMeta = ({ ink, children }: { ink: string; children: ReactNode }) => (
  <div
    style={{
      padding: "0 12px",
      display: "flex",
      alignItems: "center",
      borderRight: `${TERMINAL.borderW}px solid ${ink}`,
      opacity: 0.7,
    }}
  >
    {children}
  </div>
);

interface CmdKeyProps {
  ink: string;
  accent: string;
  k: string;
  label: string;
  onClick: () => void;
  count?: number;
}

const CmdKey = ({ ink, accent, k, label, onClick, count }: CmdKeyProps) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 14px",
        border: "none",
        borderRight: `${TERMINAL.borderW}px solid ${ink}`,
        background: hov ? accent : "transparent",
        color: hov ? "#000" : ink,
        cursor: "pointer",
        transition: "background .1s, color .1s",
        fontFamily: TERMINAL.mono,
      }}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: 11,
          padding: "2px 6px",
          border: `${TERMINAL.borderW}px solid ${hov ? "#000" : ink}`,
        }}
      >
        {k}
      </span>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em" }}>
        {label}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: 10, opacity: hov ? 0.8 : 0.5 }}>
          ({count})
        </span>
      )}
    </button>
  );
};
