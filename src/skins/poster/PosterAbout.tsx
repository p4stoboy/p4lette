import { ReactNode } from "react";
import { Backdrop } from "./Backdrop";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
  onClose: () => void;
}

const link = (ink: string) => ({
  color: ink,
  textDecoration: "underline" as const,
});

const Ref = ({
  ink,
  href,
  children,
}: {
  ink: string;
  href: string;
  children: ReactNode;
}) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={link(ink)}>
    {children}
  </a>
);

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
            JSON, CSS — start from a preset or shape your own template.
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
            React + Vite, with an OKLCH-first color engine (credits below).
            State persists to URL hash and localStorage, so any palette is a
            shareable link. Open source on GitHub.
          </AboutBlock>
          <AboutBlock ink={ink} title="SEE ALSO">
            More from{" "}
            <Ref ink={ink} href="https://github.com/meodai">
              @meodai
            </Ref>{" "}
            in the same neighbourhood:{" "}
            <Ref ink={ink} href="https://pickypalette.color.pizza/">
              pickypalette
            </Ref>{" "}
            (interactive palette picker) and{" "}
            <Ref ink={ink} href="https://palettarium.color.pizza/">
              palettarium
            </Ref>{" "}
            (a curated palette gallery).
          </AboutBlock>
          <AboutBlock ink={ink} title="CREDITS" wide>
            <p style={{ margin: 0 }}>
              The colour engine is{" "}
              <Ref ink={ink} href="https://github.com/Evercoder/culori">
                culori
              </Ref>{" "}
              by Evercoder — the OKLCH maths and converters, and the transforms
              behind <strong>FIXERS</strong> (colour-vision sim, in-gamut snap),{" "}
              <strong>EFFECTS</strong> (filters &amp; blend) and{" "}
              <strong>MIX</strong> (interpolation).
            </p>
            <p style={{ margin: "8px 0 0" }}>
              Almost everything else is{" "}
              <Ref ink={ink} href="https://github.com/meodai">
                @meodai
              </Ref>
              &apos;s:{" "}
              <Ref
                ink={ink}
                href="https://github.com/meodai/pro-color-harmonies"
              >
                pro-color-harmonies
              </Ref>{" "}
              drives <strong>HARMONY</strong>&apos;s geometric styles (and the
              tints/shades);{" "}
              <Ref ink={ink} href="https://meodai.github.io/RYBitten/">
                rybitten
              </Ref>{" "}
              is the painter&apos;s pigment wheels behind{" "}
              <strong>PIGMENT</strong>;{" "}
              <Ref ink={ink} href="https://www.npmjs.com/package/dittotones">
                dittotones
              </Ref>{" "}
              and{" "}
              <Ref ink={ink} href="https://github.com/meodai/fettepalette">
                fettepalette
              </Ref>{" "}
              are the two <strong>TONES</strong> ramps;{" "}
              <Ref ink={ink} href="https://github.com/meodai/rampensau">
                rampensau
              </Ref>{" "}
              powers <strong>SHUFFLE</strong>, the HSV harmonies and the
              GENERATIVE tone;{" "}
              <Ref ink={ink} href="https://github.com/meodai/poline">
                poline
              </Ref>{" "}
              is the POLINE ANCHORS shuffle strategy; and{" "}
              <Ref ink={ink} href="https://color.pizza/">
                color.pizza
              </Ref>{" "}
              is the colour-name database — the naming layer of this tool exists
              because theirs does.
            </p>
          </AboutBlock>
        </div>
      </div>
    </div>
  </Backdrop>
);

interface AboutBlockProps {
  ink: string;
  title: string;
  wide?: boolean;
  children: ReactNode;
}

const AboutBlock = ({ ink, title, wide, children }: AboutBlockProps) => (
  <div
    style={{
      borderTop: `2px solid ${ink}`,
      paddingTop: 10,
      ...(wide ? { gridColumn: "1 / -1" } : {}),
    }}
  >
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
