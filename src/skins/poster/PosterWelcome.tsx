import { Backdrop } from "./Backdrop";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  onClose: () => void;
}

const KEYMAP: ReadonlyArray<readonly [string, string]> = [
  ["SPACE", "Shuffle unlocked colors"],
  ["CLICK", "Edit a color inline"],
  ["DRAG", "Reorder columns"],
  ["L", "Lock a color"],
  ["E", "Open export sheet"],
];

export const PosterWelcome = ({ ink, bg, onClose }: Props) => (
  <Backdrop onClose={onClose}>
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: bg,
        color: ink,
        border: `${POSTER.borderW}px solid ${ink}`,
        width: 560,
        maxWidth: "92vw",
        maxHeight: "88vh",
        boxShadow: `12px 12px 0 ${POSTER.accent}`,
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          borderBottom: `${POSTER.borderW}px solid ${ink}`,
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: POSTER.display,
            fontSize: 20,
            letterSpacing: "0.04em",
          }}
        >
          WELCOME, COLORIST.
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            color: ink,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ padding: "20px 24px 8px" }}>
        <div
          style={{
            fontFamily: POSTER.display,
            fontSize: 64,
            lineHeight: 0.92,
            letterSpacing: "-0.03em",
            marginBottom: 10,
          }}
        >
          MAKE A
          <br />
          <span style={{ color: POSTER.accent }}>RACKET</span>
          <br />
          WITH COLOR.
        </div>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            opacity: 0.85,
            marginTop: 14,
          }}
        >
          P4LETTE is a small, opinionated palette tool. Generate, shuffle, lock,
          edit and export — then steal the result into whatever you&apos;re
          building.
        </p>
      </div>
      <div style={{ padding: "0 24px 18px", display: "grid", gap: 8 }}>
        {KEYMAP.map(([k, v]) => (
          <div
            key={k}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 13,
            }}
          >
            <span
              style={{
                fontFamily: POSTER.mono,
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 8px",
                border: `2px solid ${ink}`,
                minWidth: 48,
                textAlign: "center",
              }}
            >
              {k}
            </span>
            <span style={{ opacity: 0.85 }}>{v}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onClose}
        style={{
          width: "100%",
          padding: "14px",
          background: ink,
          color: bg,
          border: "none",
          borderTop: `${POSTER.borderW}px solid ${ink}`,
          fontFamily: POSTER.display,
          fontSize: 22,
          letterSpacing: "0.04em",
          cursor: "pointer",
        }}
      >
        LET&apos;S GO →
      </button>
    </div>
  </Backdrop>
);
