import { ReactNode } from "react";
import { BrutBackdrop } from "./BrutBackdrop";
import { TERMINAL } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  accent: string;
  onClose: () => void;
}

export const TerminalAbout = ({ ink, bg, accent, onClose }: Props) => (
  <BrutBackdrop onClose={onClose}>
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: bg,
        color: ink,
        border: `${TERMINAL.borderW}px solid ${ink}`,
        width: 620,
        maxWidth: "92vw",
        maxHeight: "88vh",
        overflow: "auto",
        boxShadow: `4px 4px 0 ${accent}`,
      }}
    >
      <div
        style={{
          padding: "6px 12px",
          borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
          background: ink,
          color: bg,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em" }}
        >
          // ABOUT.MAN
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
      <div style={{ padding: 24 }}>
        <div
          style={{
            fontFamily: TERMINAL.display,
            fontSize: 64,
            lineHeight: 0.94,
            letterSpacing: "0.01em",
          }}
        >
          P4LETTE(1)
          <br />
          <span style={{ color: accent }}>SMALL_TOOL.</span>
          <br />
          BIG_OPINION.
        </div>
        <div
          style={{
            marginTop: 22,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          <ManSection title="NAME">
            p4lette — react color palette tool
          </ManSection>
          <ManSection title="SYNOPSIS">
            p4lette [shuffle | save | export]
          </ManSection>
          <ManSection title="DESCRIPTION">
            Generates editable colors, names them via color.pizza, resolves
            custom export templates with $1.hex$, $[1,3].name$, $[all].hex$.
          </ManSection>
          <ManSection title="STORAGE">
            Saved palettes go to localStorage. Current palette syncs to the URL
            hash so links survive a refresh.
          </ManSection>
          <ManSection title="DEPS">react · color.pizza · vite</ManSection>
          <ManSection title="SOURCE">
            <a
              href="https://github.com/p4stoboy/p4lette"
              style={{ color: accent }}
            >
              github.com/p4stoboy/p4lette
            </a>
          </ManSection>
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 10,
            opacity: 0.6,
            letterSpacing: "0.12em",
          }}
        >
          // NO ACCOUNTS · NO ANALYTICS · NO DARK PATTERNS
        </div>
      </div>
    </div>
  </BrutBackdrop>
);

const ManSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div>
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.14em",
        marginBottom: 6,
        color: "#888",
      }}
    >
      {title}
    </div>
    <div>{children}</div>
  </div>
);
