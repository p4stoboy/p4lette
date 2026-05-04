import { Palette } from "../../types/Palette";
import { contrast } from "../../functions/contrast";
import { TERMINAL } from "./tokens";

interface Props {
  palette: Palette;
  ink: string;
  accent: string;
}

export const TerminalStatusline = ({ palette, ink, accent }: Props) => {
  let worst = 99;
  for (let i = 0; i < palette.length; i++) {
    for (let j = i + 1; j < palette.length; j++) {
      const r = contrast(palette[i].hex, palette[j].hex);
      if (r < worst) worst = r;
    }
  }
  const grade =
    worst >= 7 ? "AAA" : worst >= 4.5 ? "AA" : worst >= 3 ? "AA-LG" : "FAIL";

  const cell = (
    text: string,
    opts?: { right?: boolean; bold?: boolean; color?: string },
  ) => (
    <span
      style={{
        padding: "0 12px",
        borderRight: opts?.right
          ? "none"
          : `${TERMINAL.borderW}px solid ${ink}`,
        borderLeft: opts?.right ? `${TERMINAL.borderW}px solid ${ink}` : "none",
        opacity: opts?.bold ? 1 : 0.85,
        fontWeight: opts?.bold ? 700 : 400,
        color: opts?.color,
        height: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      {text}
    </span>
  );

  return (
    <div
      style={{
        borderTop: `${TERMINAL.borderW}px solid ${ink}`,
        display: "flex",
        flexShrink: 0,
        fontSize: 11,
        letterSpacing: "0.1em",
        height: 28,
        alignItems: "center",
      }}
    >
      {cell("READY_", { bold: true, color: accent })}
      {cell(`CONTRAST.MIN: ${worst.toFixed(2)} [${grade}]`)}
      {cell("NAMES: color.pizza/v1")}
      {cell("STORE: localStorage + url.hash")}
      <div style={{ flex: 1 }} />
      {cell("p4lette.app", { right: true })}
    </div>
  );
};
