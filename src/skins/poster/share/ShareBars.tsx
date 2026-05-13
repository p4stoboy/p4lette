import { fontColorFor } from "../../../functions/contrast";
import { POSTER } from "../tokens";

interface Props {
  ink: string;
  hexes: string[];
  names: string[] | null;
}

// A tall horizontal strip — one block per colour, name (when shown) + hex
// bottom-anchored in each.
export const ShareBars = ({ ink, hexes, names }: Props) => (
  <div
    style={{
      display: "flex",
      height: 140,
      borderTop: `1px solid ${ink}`,
      borderBottom: `1px solid ${ink}`,
    }}
  >
    {hexes.map((h, i) => {
      const fg = fontColorFor(h);
      return (
        <div
          key={i}
          style={{
            flex: 1,
            minWidth: 0,
            background: h,
            color: fg,
            borderLeft: i ? `1px solid ${ink}` : "none",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "14px 12px",
          }}
        >
          {names?.[i] && (
            <div
              style={{
                fontFamily: POSTER.body,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {names[i]}
            </div>
          )}
          <div style={{ fontFamily: POSTER.mono, fontSize: 12, opacity: 0.9 }}>
            {h.toUpperCase()}
          </div>
        </div>
      );
    })}
  </div>
);
