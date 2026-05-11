import { ReactNode } from "react";
import { Backdrop } from "./Backdrop";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
  onClose: () => void;
}

export const PosterAbout = ({ ink, bg, isMobile, onClose }: Props) => (
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
      <div style={{ padding: isMobile ? 18 : 28 }}>
        <div
          style={{
            fontFamily: POSTER.display,
            fontSize: isMobile ? 56 : 88,
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
        <a
          href="https://github.com/p4stoboy/p4lette"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginTop: 22,
            padding: "12px 18px",
            border: `${POSTER.borderW}px solid ${ink}`,
            background: ink,
            color: bg,
            fontFamily: POSTER.body,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textDecoration: "none",
            boxShadow: `4px 4px 0 ${POSTER.accent}`,
          }}
        >
          → View source on GitHub
        </a>
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.6,
          }}
        >
          made by p4stoboy · pull requests welcome
        </div>
        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 18,
          }}
        >
          <AboutBlock ink={ink} title="HOW TO">
            Click a column to edit. Drag to reorder. Hit shuffle to randomize
            the unlocked ones. Save what you love to the vault. Export as code,
            JSON, CSS — whatever your project needs.
          </AboutBlock>
          <AboutBlock ink={ink} title="WHY">
            Export templates are the point. Write{" "}
            <code style={{ fontFamily: POSTER.mono, fontSize: 12 }}>
              $1.hex$
            </code>{" "}
            for the first hex,{" "}
            <code style={{ fontFamily: POSTER.mono, fontSize: 12 }}>
              $[all].name$
            </code>{" "}
            for every color name, and the template resolves at copy time. Most
            palette tools lock you into their export shapes; this one lets you
            shape it.
          </AboutBlock>
          <AboutBlock ink={ink} title="UNDER THE HOOD">
            React + Vite. State persists to URL hash and localStorage so any
            palette is a shareable link. Open source on GitHub.
          </AboutBlock>
          <AboutBlock ink={ink} title="BUILT WITH">
            Color names and lists from{" "}
            <a
              href="https://color.pizza/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: ink, textDecoration: "underline" }}
            >
              color.pizza
            </a>{" "}
            by{" "}
            <a
              href="https://github.com/meodai"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: ink, textDecoration: "underline" }}
            >
              @meodai
            </a>
            . The naming layer of this tool exists because theirs does.
          </AboutBlock>
          <AboutBlock ink={ink} title="SEE ALSO">
            More from @meodai in the same neighbourhood:{" "}
            <a
              href="https://pickypalette.color.pizza/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: ink, textDecoration: "underline" }}
            >
              pickypalette
            </a>{" "}
            (interactive palette picker) and{" "}
            <a
              href="https://palettarium.color.pizza/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: ink, textDecoration: "underline" }}
            >
              palettarium
            </a>{" "}
            (a curated palette gallery).
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
