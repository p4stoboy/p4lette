import { contrast, fontColorFor } from "../../../functions/contrast";
import { POSTER } from "../tokens";

interface Props {
  ink: string;
  hexes: string[];
}

// green = AA+ (≥4.5:1), amber = AA Large (≥3:1), red = fails normal text.
const dotColor = (r: number): string =>
  r >= 4.5 ? "#22c55e" : r >= 3 ? "#f59e0b" : "#ef4444";

// An (N+1)×(N+1) grid — header row/col are colour swatches; cell (row i, col j) is
// colour i's hex as *text* on colour j's *background*, with the WCAG ratio + a
// pass dot. The diagonal (a colour on itself) is 1.0, drawn dim.
export const ShareContrastMatrix = ({ ink, hexes }: Props) => {
  const n = hexes.length;
  return (
    <div style={{ overflowX: "auto", padding: 16, width: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `2.4em repeat(${n}, minmax(38px, 1fr))`,
          gap: 1,
          background: ink,
          border: `1px solid ${ink}`,
          minWidth: 38 * n + 40,
        }}
      >
        <div style={{ background: POSTER.bg }} />
        {hexes.map((h, j) => (
          <div
            key={`ch${j}`}
            title={h.toUpperCase()}
            style={{
              background: h,
              color: fontColorFor(h),
              fontFamily: POSTER.mono,
              fontSize: 9,
              textAlign: "center",
              padding: "7px 2px",
            }}
          >
            {String(j + 1).padStart(2, "0")}
          </div>
        ))}
        {hexes.flatMap((rowHex, i) => [
          <div
            key={`rh${i}`}
            title={rowHex.toUpperCase()}
            style={{
              background: rowHex,
              color: fontColorFor(rowHex),
              fontFamily: POSTER.mono,
              fontSize: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 2px",
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </div>,
          ...hexes.map((bgHex, j) => {
            const r = contrast(rowHex, bgHex);
            const diag = i === j;
            return (
              <div
                key={`c${i}_${j}`}
                title={`#${rowHex.slice(1).toUpperCase()} on #${bgHex.slice(1).toUpperCase()} · ${r.toFixed(2)}:1`}
                style={{
                  background: bgHex,
                  color: diag ? fontColorFor(bgHex) : rowHex,
                  fontFamily: POSTER.mono,
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  padding: "9px 2px",
                }}
              >
                <span style={diag ? { opacity: 0.4 } : undefined}>
                  {r.toFixed(1)}
                </span>
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: diag ? ink : dotColor(r),
                    opacity: diag ? 0.3 : 1,
                  }}
                />
              </div>
            );
          }),
        ])}
      </div>
    </div>
  );
};
