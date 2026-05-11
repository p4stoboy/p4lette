import { Palette } from "../../types/Palette";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  palette: Palette;
  nameList: string;
}

const COPIES = 8;

export const PosterTicker = ({ ink, palette, nameList }: Props) => {
  const hexStrip = palette
    .map((c) => c.hex.replace("#", "").toUpperCase())
    .join("  ◇  ");
  const lockedCount = palette.filter((c) => c.locked).length;
  const items = [
    hexStrip || "EMPTY PALETTE",
    `${palette.length} COLOR${palette.length === 1 ? "" : "S"} LIVE`,
    `${lockedCount} LOCKED`,
    `NAMES · ${nameList.toUpperCase()}`,
  ];
  const row = items.join("  ✺  ") + "  ✺  ";

  return (
    <div
      style={{
        borderBottom: `${POSTER.borderW}px solid ${ink}`,
        padding: "6px 0",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        className="p4l-marquee"
        aria-hidden="true"
        style={{
          display: "inline-flex",
          fontFamily: POSTER.display,
          fontSize: 18,
          letterSpacing: "0.06em",
          whiteSpace: "nowrap",
          animation: "p4l-marquee 60s linear infinite",
          willChange: "transform",
        }}
      >
        {Array.from({ length: COPIES }, (_, i) => (
          <span key={i}>{row}</span>
        ))}
      </div>
    </div>
  );
};
