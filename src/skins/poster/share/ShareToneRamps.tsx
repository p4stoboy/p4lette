import { dittoMatch, tones } from "../../../functions/tones";
import { POSTER } from "../tokens";

interface Props {
  ink: string;
  hexes: string[];
}

// Each palette colour expanded into an 11-step perceptual scale (dittoTones,
// Tailwind reference set) — captioned with the nearest design-token shade.
export const ShareToneRamps = ({ ink, hexes }: Props) => (
  <div
    style={{ display: "flex", flexDirection: "column", padding: 16, gap: 12 }}
  >
    {hexes.map((h, i) => {
      const scale = tones(h, "ditto");
      const match = dittoMatch(h);
      return (
        <div key={i}>
          <div
            style={{
              fontFamily: POSTER.mono,
              fontSize: 10,
              opacity: 0.65,
              marginBottom: 5,
              display: "flex",
              gap: 10,
            }}
          >
            <span style={{ fontWeight: 700 }}>{h.toUpperCase()}</span>
            <span>≈ {match.shade}</span>
          </div>
          <div
            style={{ display: "flex", height: 30, border: `1px solid ${ink}` }}
          >
            {scale.map((s, j) => (
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
