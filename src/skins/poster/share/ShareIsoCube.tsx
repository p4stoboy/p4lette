import { isoBlockStack } from "../../../functions/iso_cube";
import { hexToOkhsl, okhslToHex } from "../../../functions/color_converters";

interface Props {
  ink: string;
  hexes: string[];
}

// Nudge a colour's Okhsl lightness, clamped — the iso faces want a top / left /
// right shading step so the stack reads as 3-D.
const shade = (hex: string, dL: number): string => {
  const o = hexToOkhsl(hex);
  return okhslToHex({ ...o, l: Math.max(0, Math.min(1, o.l + dL)) });
};

export const ShareIsoCube = ({ ink, hexes }: Props) => {
  const stack = isoBlockStack(hexes.length, { unit: 110, cube: 64 });
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <svg
        viewBox={`0 0 ${stack.width} ${stack.height}`}
        width={Math.min(stack.width, 320)}
        role="img"
        aria-label="palette as an isometric stack"
        style={{ display: "block", maxWidth: "100%", height: "auto" }}
      >
        {stack.blocks.map((b, i) => {
          const h = hexes[i];
          return (
            <g key={i}>
              <polygon
                points={b.left}
                fill={shade(h, -0.1)}
                stroke={ink}
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              <polygon
                points={b.right}
                fill={shade(h, -0.18)}
                stroke={ink}
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              <polygon
                points={b.top}
                fill={shade(h, 0.06)}
                stroke={ink}
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
