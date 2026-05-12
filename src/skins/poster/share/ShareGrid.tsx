import { fontColorFor } from "../../../functions/contrast";
import { POSTER } from "../tokens";

interface Props {
  ink: string;
  hexes: string[];
  names: string[] | null;
}

// A read-only echo of the editor's swatch columns — one cell per colour, the
// faint index, and (when shown) the colour name above its hex.
export const ShareGrid = ({ ink, hexes, names }: Props) => (
  <div style={{ display: "flex", padding: 20 }}>
    {hexes.map((h, i) => {
      const fg = fontColorFor(h);
      return (
        <div
          key={i}
          style={{
            flex: 1,
            minWidth: 0,
            aspectRatio: "3 / 4",
            background: h,
            color: fg,
            position: "relative",
            padding: 14,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            border: `1px solid ${ink}`,
            marginLeft: i ? -1 : 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 14,
              fontFamily: POSTER.display,
              fontSize: 56,
              lineHeight: 0.85,
              opacity: 0.16,
              pointerEvents: "none",
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </div>
          {names?.[i] && (
            <div
              style={{
                fontFamily: POSTER.display,
                fontSize: 20,
                lineHeight: 1,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                textWrap: "balance",
              }}
            >
              {names[i]}
            </div>
          )}
          <div
            style={{
              fontFamily: POSTER.mono,
              fontSize: 13,
              opacity: 0.85,
              marginTop: 6,
            }}
          >
            {h.toUpperCase()}
          </div>
        </div>
      );
    })}
  </div>
);
