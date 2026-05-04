import { Palette } from "../../types/Palette";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  roll: number;
  palette: Palette;
}

export const PosterTicker = ({ ink, roll, palette }: Props) => {
  const items = [
    "COLOR-PIZZA NAMING ✺",
    `${palette.length} COLORS LIVE ✺`,
    "DRAG TO REORDER ✺",
    "CLICK TO EDIT ✺",
    "LOCK TO PROTECT ✺",
    "SHUFFLE THE REST ✺",
  ];
  const text = items.join("  ◇  ") + "  ◇  ";
  return (
    <div
      style={{
        borderBottom: `${POSTER.borderW}px solid ${ink}`,
        padding: "6px 0",
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
      }}
    >
      <div
        style={{
          fontFamily: POSTER.display,
          fontSize: 18,
          letterSpacing: "0.06em",
          whiteSpace: "nowrap",
          transform: `translateX(${-roll * 1.5}px)`,
          display: "inline-block",
        }}
      >
        {text.repeat(8)}
      </div>
    </div>
  );
};
