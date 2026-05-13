import { simulateCvd, type CvdType } from "../../../functions/color_filters";
import { POSTER } from "../tokens";

interface Props {
  ink: string;
  hexes: string[];
}

const ROWS: { label: string; type: CvdType | null }[] = [
  { label: "NORMAL VISION", type: null },
  { label: "PROTANOPIA", type: "prot" },
  { label: "DEUTERANOPIA", type: "deuter" },
  { label: "TRITANOPIA", type: "trit" },
];

// The palette as it reads to viewers with each colour-vision deficiency
// (Brettel/Viénot, full severity) — with a NORMAL row to compare against.
export const ShareCvd = ({ ink, hexes }: Props) => (
  <div
    style={{ display: "flex", flexDirection: "column", padding: 16, gap: 10 }}
  >
    {ROWS.map(({ label, type }) => {
      const row = type ? simulateCvd(hexes, type) : hexes;
      return (
        <div key={label}>
          <div
            style={{
              fontFamily: POSTER.body,
              fontWeight: 700,
              fontSize: 9,
              letterSpacing: "0.12em",
              opacity: 0.55,
              marginBottom: 4,
            }}
          >
            {label}
          </div>
          <div
            style={{ display: "flex", height: 32, border: `1px solid ${ink}` }}
          >
            {row.map((s, j) => (
              <div
                key={j}
                title={s.toUpperCase()}
                style={{
                  flex: 1,
                  background: s,
                  borderLeft: j ? `1px solid ${ink}` : "none",
                }}
              />
            ))}
          </div>
        </div>
      );
    })}
  </div>
);
