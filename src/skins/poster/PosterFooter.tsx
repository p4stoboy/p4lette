import { ReactNode, useState } from "react";
import { Palette } from "../../types/Palette";
import { contrast } from "../../functions/contrast";
import { POSTER } from "./tokens";
import { PosterNamingPicker } from "./PosterNamingPicker";
import { PosterModePicker } from "./PosterModePicker";

interface Props {
  palette: Palette;
  ink: string;
  bg: string;
}

export const PosterFooter = ({ palette, ink, bg }: Props) => {
  let worst = { ratio: 99, a: "", b: "" };
  for (let i = 0; i < palette.length; i++) {
    for (let j = i + 1; j < palette.length; j++) {
      const r = contrast(palette[i].hex, palette[j].hex);
      if (r < worst.ratio)
        worst = { ratio: r, a: palette[i].hex, b: palette[j].hex };
    }
  }
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
      <Stat ink={ink} label="LIVE">
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            background: "#22c55e",
            borderRadius: 4,
            marginRight: 6,
          }}
        />
        STREAMING
      </Stat>
      <Stat ink={ink} label="CONTRAST">
        <span style={{ color: gradeColor, fontWeight: 700 }}>
          {worst.ratio.toFixed(2)}:1 · {grade}
        </span>
      </Stat>
      <Stat ink={ink} label="MODE">
        <PosterModePicker ink={ink} bg={bg} />
      </Stat>
      <Stat ink={ink} label="NAMING">
        <PosterNamingPicker ink={ink} bg={bg} />
      </Stat>
      <div style={{ flex: 1 }} />
      <Stat ink={ink} label="SHARE" right>
        <ShareButton ink={ink} />
      </Stat>
    </div>
  );
};

const ShareButton = ({ ink }: { ink: string }) => {
  const [label, setLabel] = useState("URL ↗");
  const handleClick = async () => {
    const url = window.location.href;
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
