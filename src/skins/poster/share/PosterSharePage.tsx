import { CSSProperties, ReactNode, useState } from "react";
import {
  DEFAULT_NAME_LIST,
  getColorNames,
} from "../../../functions/get_color_card_props";
import { POSTER } from "../tokens";
import { parseShareHash } from "./parseShareHash";
import { ShareGrid } from "./ShareGrid";
import { ShareIsoCube } from "./ShareIsoCube";
import { ShareBars } from "./ShareBars";
import { ShareLine } from "./ShareLine";
import { ShareDots } from "./ShareDots";

interface Props {
  hash: string;
}

const enc = (hexes: string[]): string => hexes.map((h) => h.slice(1)).join("-");

const btnStyle = (ink: string): CSSProperties => ({
  fontFamily: POSTER.body,
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  padding: "8px 12px",
  border: `2px solid ${ink}`,
  background: "transparent",
  color: ink,
  cursor: "pointer",
  textDecoration: "none",
});

const CopyBtn = ({
  ink,
  label,
  text,
}: {
  ink: string;
  label: string;
  text: string;
}) => {
  const [l, setL] = useState(label);
  return (
    <button
      onClick={() => {
        if (!navigator.clipboard) return;
        navigator.clipboard.writeText(text).then(
          () => {
            setL("COPIED ✓");
            window.setTimeout(() => setL(label), 1500);
          },
          () => {},
        );
      }}
      style={btnStyle(ink)}
    >
      {l}
    </button>
  );
};

const Wordmark = () => (
  <span
    style={{
      fontFamily: POSTER.display,
      fontSize: 40,
      letterSpacing: "-0.02em",
    }}
  >
    P4<span style={{ color: POSTER.accent }}>★</span>LETTE
  </span>
);

const SharePanel = ({
  ink,
  label,
  children,
}: {
  ink: string;
  label: string;
  children: ReactNode;
}) => (
  <div style={{ borderBottom: `${POSTER.borderW}px solid ${ink}` }}>
    <div
      style={{
        fontFamily: POSTER.body,
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        opacity: 0.55,
        padding: "12px 24px 0",
      }}
    >
      {label}
    </div>
    {children}
  </div>
);

// The share page — a read-only, light-theme-only card reachable at
// `…#/share?p=rrggbb-…`. No PaletteContext: the palette comes straight from the
// hash. Several representations + an "open in p4lette" link back to the editor.
export const PosterSharePage = ({ hash }: Props) => {
  const ink = POSTER.ink;
  const bg = POSTER.bg;
  const hexes = parseShareHash(hash);
  const [names, setNames] = useState<string[] | null>(null);
  const [namesLabel, setNamesLabel] = useState("SHOW NAMES");
  const path = typeof window === "undefined" ? "/" : window.location.pathname;
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  if (!hexes || hexes.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: bg,
          color: ink,
          fontFamily: POSTER.body,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
        }}
      >
        <div style={{ fontFamily: POSTER.display, fontSize: 36 }}>
          NOTHING TO SHOW.
        </div>
        <a
          href={path}
          style={{
            color: ink,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          ← open p4lette
        </a>
      </div>
    );
  }

  const editorHref = `${path}#p=${enc(hexes)}`;
  const shareHref = `${origin}${path}#/share?p=${enc(hexes)}`;

  const showNames = () => {
    if (names) return;
    setNamesLabel("LOADING…");
    getColorNames(hexes, { list: DEFAULT_NAME_LIST }).then((n) => {
      setNames(n);
      setNamesLabel("NAMED");
    });
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        background: bg,
        color: ink,
        fontFamily: POSTER.body,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
          padding: "16px 24px",
          borderBottom: `${POSTER.borderW}px solid ${ink}`,
        }}
      >
        <Wordmark />
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <button onClick={showNames} style={btnStyle(ink)}>
            {namesLabel}
          </button>
          <CopyBtn ink={ink} label="COPY LINK" text={shareHref} />
          <a href={editorHref} style={{ ...btnStyle(ink), borderLeftWidth: 4 }}>
            open in p4lette →
          </a>
        </div>
      </div>

      <SharePanel ink={ink} label="grid">
        <ShareGrid ink={ink} hexes={hexes} names={names} />
      </SharePanel>
      <SharePanel ink={ink} label="iso cube">
        <ShareIsoCube ink={ink} hexes={hexes} />
      </SharePanel>
      <SharePanel ink={ink} label="classic bars">
        <ShareBars ink={ink} hexes={hexes} names={names} />
      </SharePanel>
      <SharePanel ink={ink} label="line">
        <ShareLine ink={ink} hexes={hexes} />
      </SharePanel>
      <SharePanel ink={ink} label="dots">
        <ShareDots ink={ink} hexes={hexes} />
      </SharePanel>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          padding: "16px 24px",
        }}
      >
        <span style={{ fontFamily: POSTER.mono, fontSize: 12, opacity: 0.7 }}>
          {hexes.map((h) => h.toUpperCase()).join(" · ")}
        </span>
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <CopyBtn
            ink={ink}
            label="COPY HEXES"
            text={hexes.map((h) => h.toUpperCase()).join(", ")}
          />
          <a href={path} style={{ fontSize: 11, opacity: 0.7, color: ink }}>
            made with p4lette
          </a>
        </span>
      </div>
    </div>
  );
};
