import { ReactNode, useState } from "react";
import { Palette } from "../../types/Palette";
import { contrast } from "../../functions/contrast";
import { encodePalette } from "../../functions/share_url";
import { POSTER } from "./tokens";

interface Props {
  palette: Palette;
  ink: string;
  onAbout: () => void;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export const PosterFooter = ({ palette, ink, onAbout }: Props) => {
  // Lowest-contrast pair in the palette — track the swatch indices so the chip
  // can name them (`#01 ↔ #04`) and show their colours side by side.
  let worst = { ratio: Infinity, ia: -1, ib: -1 };
  for (let i = 0; i < palette.length; i++) {
    for (let j = i + 1; j < palette.length; j++) {
      const r = contrast(palette[i].hex, palette[j].hex);
      if (r < worst.ratio) worst = { ratio: r, ia: i, ib: j };
    }
  }
  const hasPair = worst.ia >= 0 && worst.ib >= 0;
  const grade =
    worst.ratio >= 7
      ? "AAA"
      : worst.ratio >= 4.5
        ? "AA"
        : worst.ratio >= 3
          ? "AA Lg"
          : "FAIL";
  const gradeColor =
    worst.ratio >= 4.5 ? "#22c55e" : worst.ratio >= 3 ? "#f59e0b" : "#ef4444";

  return (
    <div
      style={{
        borderTop: `${POSTER.borderW}px solid ${ink}`,
        display: "flex",
        alignItems: "stretch",
        flexShrink: 0,
        fontFamily: POSTER.body,
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      <Stat ink={ink} label="LOWEST CONTRAST">
        {hasPair ? (
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
          >
            <span
              style={{ display: "inline-flex", border: `2px solid ${ink}` }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  background: palette[worst.ia].hex,
                }}
              />
              <span
                style={{
                  width: 16,
                  height: 16,
                  background: palette[worst.ib].hex,
                }}
              />
            </span>
            <span>
              #{pad2(worst.ia + 1)} ↔ #{pad2(worst.ib + 1)}
            </span>
            <span style={{ color: gradeColor, fontWeight: 700 }}>
              {worst.ratio.toFixed(2)}:1 · {grade}
            </span>
          </span>
        ) : (
          <span style={{ opacity: 0.5 }}>—</span>
        )}
      </Stat>
      <div style={{ flex: 1 }} />
      <FooterBtn ink={ink} onClick={onAbout}>
        ABOUT
      </FooterBtn>
      <Stat ink={ink} label="SHARE" right>
        <ShareButton ink={ink} palette={palette} />
      </Stat>
    </div>
  );
};

// A footer-sized version of the top-nav button — hover inverts to ink/bg.
const FooterBtn = ({
  ink,
  onClick,
  children,
}: {
  ink: string;
  onClick: () => void;
  children: ReactNode;
}) => {
  const [hov, setHov] = useState(false);
  const invert = ink === POSTER.ink ? POSTER.bg : POSTER.ink;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: POSTER.body,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "10px 18px",
        border: "none",
        borderLeft: `${POSTER.borderW}px solid ${ink}`,
        background: hov ? ink : "transparent",
        color: hov ? invert : ink,
        cursor: "pointer",
        transition: "background .12s, color .12s",
      }}
    >
      {children}
    </button>
  );
};

const ShareButton = ({ ink, palette }: { ink: string; palette: Palette }) => {
  const [label, setLabel] = useState("URL ↗");
  const handleClick = async () => {
    const enc = encodePalette(palette);
    const base = window.location.origin + window.location.pathname;
    const url = enc ? `${base}#/share?p=${enc}` : base;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ url, title: "P4LETTE" });
      } catch {
        /* user dismissed or share unavailable — share sheet is sufficient UI */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setLabel("COPIED ✓");
    } catch {
      setLabel("FAILED");
    }
    window.setTimeout(() => setLabel("URL ↗"), 1500);
  };
  return (
    <button
      onClick={handleClick}
      aria-label="share palette URL"
      style={{
        background: "transparent",
        border: "none",
        color: ink,
        font: "inherit",
        letterSpacing: "inherit",
        textTransform: "inherit",
        padding: 0,
        cursor: "pointer",
        textDecoration: "underline",
        textUnderlineOffset: 2,
      }}
    >
      {label}
    </button>
  );
};

interface StatProps {
  ink: string;
  label: string;
  children: ReactNode;
  right?: boolean;
}

const Stat = ({ ink, label, children, right }: StatProps) => (
  <div
    style={{
      padding: "10px 18px",
      borderRight: right ? "none" : `${POSTER.borderW}px solid ${ink}`,
      borderLeft: right ? `${POSTER.borderW}px solid ${ink}` : "none",
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}
  >
    <span style={{ fontWeight: 700, opacity: 0.5 }}>{label}</span>
    <span>{children}</span>
  </div>
);
