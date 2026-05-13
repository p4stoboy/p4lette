import { fontColorFor } from "../../../functions/contrast";
import { POSTER } from "../tokens";

interface Props {
  ink: string;
  hexes: string[];
}

// The palette as a square n×n mosaic — n = ⌈√count⌉, cells filled by cycling the
// palette in order so the colour sequence stays legible across the quilt.
export const ShareMosaic = ({ ink, hexes }: Props) => {
  const count = hexes.length;
  const n = Math.max(1, Math.ceil(Math.sqrt(count)));
  const cells = Array.from({ length: n * n }, (_, i) => i % count);
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        minHeight: 220,
        minWidth: 0,
      }}
    >
      <div
        role="img"
        aria-label="palette as an n×n mosaic"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${n}, 1fr)`,
          gridTemplateRows: `repeat(${n}, 1fr)`,
          aspectRatio: "1 / 1",
          width: "100%",
          maxHeight: "100%",
          gap: 1,
          background: ink,
          border: `1px solid ${ink}`,
          boxSizing: "border-box",
        }}
      >
        {cells.map((ci, i) => {
          const h = hexes[ci];
          return (
            <div
              key={i}
              title={h.toUpperCase()}
              style={{
                background: h,
                color: fontColorFor(h),
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                padding: 5,
                fontFamily: POSTER.mono,
                fontSize: 9,
                overflow: "hidden",
              }}
            >
              <span style={{ opacity: 0.4 }}>
                {String(ci + 1).padStart(2, "0")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
