import { hexToOkhsl } from "../../../functions/color_converters";

interface Props {
  ink: string;
  hexes: string[];
}

const SIZE = 220;
const C = SIZE / 2;
const R = C - 14; // outer guide radius (leave room for a dot's stroke)

// The palette plotted on a hue wheel — bearing = Okhsl hue (0° at the top),
// distance from centre = Okhsl saturation (muted near the middle, vivid at the rim).
export const ShareWheel = ({ ink, hexes }: Props) => {
  const ticks = Array.from(
    { length: 12 },
    (_, i) => ((i * 30 - 90) * Math.PI) / 180,
  );
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        role="img"
        aria-label="palette plotted on a hue wheel"
        style={{ display: "block", maxWidth: "100%", height: "auto" }}
      >
        <circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke={ink}
          strokeWidth={1}
          opacity={0.5}
        />
        <circle
          cx={C}
          cy={C}
          r={R * 0.55}
          fill="none"
          stroke={ink}
          strokeWidth={1}
          opacity={0.22}
        />
        {ticks.map((a, i) => (
          <line
            key={i}
            x1={C}
            y1={C}
            x2={C + R * Math.cos(a)}
            y2={C + R * Math.sin(a)}
            stroke={ink}
            strokeWidth={1}
            opacity={0.12}
          />
        ))}
        {hexes.map((h, i) => {
          const { h: hue, s } = hexToOkhsl(h);
          const rho = (0.18 + 0.78 * s) * R;
          const a = ((hue - 90) * Math.PI) / 180;
          const cx = C + rho * Math.cos(a);
          const cy = C + rho * Math.sin(a);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={9}
              fill={h}
              stroke={ink}
              strokeWidth={2}
            >
              <title>{h.toUpperCase()}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
};
