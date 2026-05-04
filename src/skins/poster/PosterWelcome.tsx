import { Backdrop } from "./Backdrop";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
  onClose: () => void;
}

const KEYMAP: ReadonlyArray<readonly [string, string]> = [
  ["SPACE", "Shuffle unlocked colors"],
  ["TAP", "Edit a color inline"],
  ["DRAG", "Reorder columns"],
  ["L", "Lock a color"],
  ["E", "Open export sheet"],
];

export const PosterWelcome = ({ ink, bg, isMobile, onClose }: Props) => (
  <Backdrop onClose={onClose}>
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: bg,
        color: ink,
        border: `${POSTER.borderW}px solid ${ink}`,
        width: 560,
        maxWidth: "92vw",
        maxHeight: "92vh",
        overflow: "auto",
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
          flexShrink: 0,
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
      <div style={{ padding: isMobile ? "16px 18px 8px" : "20px 24px 8px" }}>
        <div
          style={{
            fontFamily: POSTER.display,
            fontSize: isMobile ? 48 : 64,
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
      {!isMobile && (
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
      )}
      <button
        onClick={onClose}
        style={{
          width: "100%",
          padding: isMobile ? "20px" : "14px",
          background: ink,
          color: bg,
          border: "none",
          borderTop: `${POSTER.borderW}px solid ${ink}`,
          fontFamily: POSTER.display,
          fontSize: 22,
          letterSpacing: "0.04em",
          cursor: "pointer",
          minHeight: isMobile ? 64 : undefined,
          touchAction: "manipulation",
        }}
      >
        LET&apos;S GO →
      </button>
    </div>
  </Backdrop>
);
