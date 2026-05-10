import { Palette } from "../../types/Palette";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  palette: Palette;
}

const COPIES = 4;

export const PosterTicker = ({ ink, palette }: Props) => {
  const items = [
    "COLOR-PIZZA NAMING ✺",
    `${palette.length} COLORS LIVE ✺`,
    "DRAG TO REORDER ✺",
    "CLICK TO EDIT ✺",
    "LOCK TO PROTECT ✺",
    "SHUFFLE THE REST ✺",
  ];
  const row = items.join("  ◇  ") + "  ◇  ";

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
