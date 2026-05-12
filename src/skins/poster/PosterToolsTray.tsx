import { Palette } from "../../types/Palette";
import { POSTER } from "./tokens";
import { TRAY_SECTIONS, sectionStyle, subHeaderStyle } from "./tools";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
  palette: Palette;
  onClose: () => void;
  onApply: (hexes: string[]) => void;
}

// The TOOLS overlay: a full-surface dialog whose body is one section per entry
// in `TRAY_SECTIONS` (`./tools`) — a responsive grid on desktop, a stacked
// scrolling column on mobile. Each section = its registered header + `Body`.
export const PosterToolsTray = ({
  ink,
  bg,
  isMobile,
  palette,
  onClose,
  onApply,
}: Props) => (
  <div
    role="dialog"
    aria-label="tools"
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 55,
      background: bg,
      color: ink,
      display: "flex",
      flexDirection: "column",
      animation: "toolsIn .22s cubic-bezier(.2,.7,.3,1)",
    }}
  >
    <style>{`@keyframes toolsIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>

    <div
      style={{
        borderBottom: `${POSTER.borderW}px solid ${ink}`,
        padding: isMobile ? "12px 16px" : "14px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 14,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <span
          style={{
            fontFamily: POSTER.display,
            fontSize: isMobile ? 28 : 34,
            letterSpacing: "-0.02em",
          }}
        >
          TOOLS
        </span>
        {!isMobile && (
          <span
            style={{
              fontFamily: POSTER.body,
              fontSize: 12,
              letterSpacing: "0.1em",
              opacity: 0.6,
            }}
          >
            HARMONY · TONES · FIXERS · PIGMENT · MIX · EFFECTS · GENERATE — hit
            USE to apply a result
          </span>
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="close"
        style={{
          background: "none",
          border: `2px solid ${ink}`,
          color: ink,
          width: isMobile ? 44 : 34,
          height: isMobile ? 44 : 34,
          cursor: "pointer",
          fontSize: 18,
          fontWeight: 700,
          alignSelf: "center",
          touchAction: "manipulation",
        }}
      >
        ×
      </button>
    </div>

    <div
      style={
        isMobile
          ? {
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }
          : {
              flex: 1,
              minHeight: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
              alignContent: "start",
              overflowY: "auto",
            }
      }
    >
      {TRAY_SECTIONS.map((s, i) => (
        <div key={s.key} style={sectionStyle(ink, isMobile, i === 0)}>
          <div style={subHeaderStyle(ink)}>{s.label}</div>
          <s.Body
            ink={ink}
            isMobile={isMobile}
            palette={palette}
            onApply={onApply}
          />
        </div>
      ))}
    </div>
  </div>
);
