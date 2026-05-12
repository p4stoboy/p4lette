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

// A wrapping row of `Toggle` chips — replaces the old "ceil(n/2) full-width rows
// framed in a 2px ink box" layout, which read like a stack of section headers.
export const pillRowStyle = () => ({
  display: "flex" as const,
  flexWrap: "wrap" as const,
  gap: 6,
});

// A small caption above a pill row ("SPACE" / "STYLE" / "BLEND MODE" / …) — set
// off from the BasePicker's own label by being a touch smaller and dimmer.
export const pillRowLabelStyle = () => ({
  fontFamily: POSTER.body,
  fontWeight: 700 as const,
  fontSize: 9,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  opacity: 0.65,
  marginBottom: 6,
});
