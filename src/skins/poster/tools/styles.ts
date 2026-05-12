import { Palette } from "../../../types/Palette";
import { POSTER } from "../tokens";

// Shared shape for every tool body. `palette` is the live palette; `onApply`
// replaces it with the result the body produced.
export interface BodyProps {
  ink: string;
  isMobile: boolean;
  palette: Palette;
  onApply: (hexes: string[]) => void;
}

export const subHeaderStyle = (ink: string) => ({
  borderBottom: `2px solid ${ink}`,
  padding: "10px 16px",
  fontFamily: POSTER.display,
  fontSize: 20,
  letterSpacing: "-0.01em",
  flexShrink: 0,
});

// The body scrolls as a whole (grid on desktop, column on mobile), so a
// section's rows just flow — no nested scroll area.
export const rowsStyle = () => ({
  flex: 1,
  overflowY: "visible" as const,
  padding: 16,
});
