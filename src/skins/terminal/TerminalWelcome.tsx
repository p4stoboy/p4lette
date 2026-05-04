import { BrutBackdrop } from "./BrutBackdrop";
import { TERMINAL } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  accent: string;
  onClose: () => void;
}

const KEYMAP: ReadonlyArray<readonly [string, string]> = [
  ["SPACE", "Shuffle unlocked colors"],
  ["CLICK", "Edit a color inline"],
  ["DRAG", "Reorder columns"],
  ["L", "Lock a color"],
  ["E", "Open export"],
  ["H", "Open harmony"],
];

const BOOT_LOG = `> p4lette init
> loading colors..... ok
> connecting color.pizza..... ok
> ready.`;

export const TerminalWelcome = ({ ink, bg, accent, onClose }: Props) => (
  <BrutBackdrop onClose={onClose}>
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: bg,
        color: ink,
        border: `${TERMINAL.borderW}px solid ${ink}`,
        width: 540,
        maxWidth: "92vw",
        boxShadow: `4px 4px 0 ${accent}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 12px",
          borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
          background: ink,
          color: bg,
        }}
      >
        <span
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em" }}
        >
          // BOOT.LOG
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
          padding: 22,
          fontFamily: TERMINAL.mono,
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <pre style={{ margin: 0, fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>
          {BOOT_LOG}
        </pre>
        <div
          style={{
            fontFamily: TERMINAL.display,
            fontSize: 56,
            lineHeight: 0.92,
            marginTop: 18,
            letterSpacing: "0.02em",
          }}
        >
          P4LETTE_
          <br />
          <span style={{ color: accent }}>FOR_DESIGNERS</span>
          <br />
          WHO_LIKE_KEYS.
        </div>
        <div style={{ marginTop: 18, display: "grid", gap: 4, fontSize: 12 }}>
          {KEYMAP.map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 12 }}>
              <span
                style={{
                  fontWeight: 700,
                  color: accent,
                  minWidth: 70,
                }}
              >
                [{k}]
              </span>
              <span style={{ opacity: 0.85 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={onClose}
        style={{
          width: "100%",
          padding: 12,
          background: accent,
          color: "#000",
          border: "none",
          borderTop: `${TERMINAL.borderW}px solid ${ink}`,
          fontFamily: TERMINAL.mono,
          fontWeight: 700,
          letterSpacing: "0.16em",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        &gt; ENTER_
      </button>
    </div>
  </BrutBackdrop>
);
