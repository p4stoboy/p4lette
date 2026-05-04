import { ReactNode } from "react";
import { Backdrop } from "./Backdrop";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  onClose: () => void;
}

export const PosterAbout = ({ ink, bg, onClose }: Props) => (
  <Backdrop onClose={onClose}>
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: bg,
        color: ink,
        border: `${POSTER.borderW}px solid ${ink}`,
        width: 640,
        maxWidth: "92vw",
        maxHeight: "88vh",
        overflow: "auto",
        boxShadow: `12px 12px 0 ${POSTER.accent}`,
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
        <div style={{ fontFamily: POSTER.display, fontSize: 20 }}>ABOUT</div>
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
      <div style={{ padding: 28 }}>
        <div
          style={{
            fontFamily: POSTER.display,
            fontSize: 88,
            lineHeight: 0.88,
            letterSpacing: "-0.03em",
          }}
        >
          COLOR
          <br />
          WITHOUT
          <br />
          <span style={{ color: POSTER.accent }}>CEREMONY.</span>
        </div>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.55,
            marginTop: 22,
            maxWidth: 480,
          }}
        >
          P4LETTE is a one-page color palette tool. Drag, click, lock, shuffle,
          name, and export. No accounts. No newsletters. No &quot;premium
          tier.&quot;
        </p>
        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
          }}
        >
          <AboutBlock ink={ink} title="HOW TO">
            Click a column to edit. Drag to reorder. Hit shuffle to randomize
            the unlocked ones. Save what you love to the vault. Export as code,
            JSON, CSS — whatever your project needs.
          </AboutBlock>
          <AboutBlock ink={ink} title="UNDER THE HOOD">
            React + Vite. Color names from <em>color.pizza</em>. State persists
            to URL and localStorage. Open source on GitHub.
          </AboutBlock>
          <AboutBlock ink={ink} title="WHY">
            Because the existing palette tools all want your email. This one
            just wants you to make something.
          </AboutBlock>
          <AboutBlock ink={ink} title="MADE BY">
            <a
              href="https://github.com/p4stoboy/p4lette"
              style={{ color: ink, textDecoration: "underline" }}
            >
              p4stoboy
            </a>
            . Pull requests welcome.
          </AboutBlock>
        </div>
      </div>
    </div>
  </Backdrop>
);

interface AboutBlockProps {
  ink: string;
  title: string;
  children: ReactNode;
}

const AboutBlock = ({ ink, title, children }: AboutBlockProps) => (
  <div style={{ borderTop: `2px solid ${ink}`, paddingTop: 10 }}>
    <div
      style={{
        fontFamily: POSTER.body,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.12em",
        marginBottom: 6,
      }}
    >
      {title}
    </div>
    <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.85 }}>
      {children}
    </div>
  </div>
);
