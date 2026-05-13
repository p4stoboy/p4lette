import { CSSProperties, ReactNode, useState } from "react";
import {
  DEFAULT_NAME_LIST,
  getColorNames,
} from "../../../functions/get_color_card_props";
import { useViewport } from "../../../hooks/use_viewport";
import { POSTER } from "../tokens";
import { parseShareHash } from "./parseShareHash";
import { ShareMosaic } from "./ShareMosaic";
import { ShareContrastMatrix } from "./ShareContrastMatrix";
import { ShareWheel } from "./ShareWheel";
import { ShareStats } from "./ShareStats";
import { ShareToneRamps } from "./ShareToneRamps";
import { ShareCvd } from "./ShareCvd";
import { ShareGrid } from "./ShareGrid";
import { ShareBars } from "./ShareBars";
import { ShareExport } from "./ShareExport";
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
  style,
}: {
  ink: string;
  label: string;
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      border: `${POSTER.borderW}px solid ${ink}`,
      display: "flex",
      flexDirection: "column",
      minWidth: 0,
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        fontFamily: POSTER.body,
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        opacity: 0.55,
        padding: "10px 16px 0",
        flexShrink: 0,
      }}
    >
      {label}
    </div>
    <div
      style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  </div>
);

// The desktop bento — `grid-template-areas` does all the spanning. On mobile we
// drop the grid and the panels stack in source order.
const DESKTOP_BENTO: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.7fr 1fr 1fr",
  gridAutoRows: "minmax(0, auto)",
  gridTemplateAreas: `
    "mosaic   matrix   matrix"
    "mosaic   wheel    stats"
    "ramps    ramps    ramps"
    "cvd      cvd      dots"
    "gridecho gridecho export"
    "bars     bars     export"
    "line     line     line"
  `,
};

// The share page — a read-only, light-theme-only "bento" of palette
// representations reachable at `…#/share?p=rrggbb-…`. No PaletteContext: the
// palette comes straight from the hash. Desktop = an irregular grid; mobile =
// one column. An "open in p4lette" link leads back to the editor.
export const PosterSharePage = ({ hash }: Props) => {
  const ink = POSTER.ink;
  const bg = POSTER.bg;
  const { isMobile } = useViewport();
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

  const area = (name: string): CSSProperties =>
    isMobile ? {} : { gridArea: name };

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

      <div
        style={
          isMobile
            ? { display: "flex", flexDirection: "column" }
            : DESKTOP_BENTO
        }
      >
        <SharePanel ink={ink} label="mosaic" style={area("mosaic")}>
          <ShareMosaic ink={ink} hexes={hexes} />
        </SharePanel>
        <SharePanel ink={ink} label="contrast matrix" style={area("matrix")}>
          <ShareContrastMatrix ink={ink} hexes={hexes} />
        </SharePanel>
        <SharePanel ink={ink} label="hue wheel" style={area("wheel")}>
          <ShareWheel ink={ink} hexes={hexes} />
        </SharePanel>
        <SharePanel ink={ink} label="palette stats" style={area("stats")}>
          <ShareStats hexes={hexes} />
        </SharePanel>
        <SharePanel
          ink={ink}
          label="tone ramps · dittotones"
          style={area("ramps")}
        >
          <ShareToneRamps ink={ink} hexes={hexes} />
        </SharePanel>
        <SharePanel ink={ink} label="colour-blindness" style={area("cvd")}>
          <ShareCvd ink={ink} hexes={hexes} />
        </SharePanel>
        <SharePanel ink={ink} label="dots" style={area("dots")}>
          <ShareDots ink={ink} hexes={hexes} />
        </SharePanel>
        <SharePanel ink={ink} label="grid" style={area("gridecho")}>
          <ShareGrid ink={ink} hexes={hexes} names={names} />
        </SharePanel>
        <SharePanel ink={ink} label="classic bars" style={area("bars")}>
          <ShareBars ink={ink} hexes={hexes} names={names} />
        </SharePanel>
        <SharePanel ink={ink} label="export" style={area("export")}>
          <ShareExport ink={ink} hexes={hexes} names={names} />
        </SharePanel>
        <SharePanel ink={ink} label="line" style={area("line")}>
          <ShareLine ink={ink} hexes={hexes} />
        </SharePanel>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          padding: "16px 24px",
          borderTop: `${POSTER.borderW}px solid ${ink}`,
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
