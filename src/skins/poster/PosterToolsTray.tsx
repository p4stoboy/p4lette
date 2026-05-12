import { useState } from "react";
import { Palette } from "../../types/Palette";
import { POSTER } from "./tokens";
import { TRAY_SECTIONS, subHeaderStyle, pillRowStyle } from "./tools";
import { Toggle } from "./tools/shared";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
  palette: Palette;
  onClose: () => void;
  onApply: (hexes: string[]) => void;
}

// The TOOLS panel: pick one tool at a time. On desktop it's a flex child of
// PosterSkin's content row (~50vw, sized by the parent — that's where the
// slide-in lives); on mobile it's a full-screen overlay. A wrapping pill-tab
// strip selects the active section from the `TRAY_SECTIONS` registry
// (`./tools`); the active body is shown, the others stay mounted (`display:none`)
// so their local state survives a tab switch.
export const PosterToolsTray = ({
  ink,
  bg,
  isMobile,
  palette,
  onClose,
  onApply,
}: Props) => {
  const [activeKey, setActiveKey] = useState(TRAY_SECTIONS[0].key);
  const active =
    TRAY_SECTIONS.find((s) => s.key === activeKey) ?? TRAY_SECTIONS[0];

  return (
    <div
      role="dialog"
      aria-label="tools"
      style={
        isMobile
          ? {
              position: "fixed",
              inset: 0,
              zIndex: 55,
              background: bg,
              color: ink,
              display: "flex",
              flexDirection: "column",
              animation: "toolsIn .22s cubic-bezier(.2,.7,.3,1)",
            }
          : {
              width: "100%",
              height: "100%",
              background: bg,
              color: ink,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }
      }
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
              pick a tool · hit USE to apply a result
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
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            ...pillRowStyle(),
            padding: isMobile ? "10px 16px" : "10px 24px",
            borderBottom: `${POSTER.borderW}px solid ${ink}`,
            flexShrink: 0,
          }}
        >
          {TRAY_SECTIONS.map((s) => (
            <Toggle
              key={s.key}
              ink={ink}
              active={s.key === activeKey}
              tall={isMobile}
              onClick={() => setActiveKey(s.key)}
            >
              {s.label}
            </Toggle>
          ))}
        </div>

        <div style={subHeaderStyle(ink)}>{active.label}</div>

        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {TRAY_SECTIONS.map((s) => (
            <div
              key={s.key}
              style={{ display: s.key === activeKey ? "block" : "none" }}
            >
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
    </div>
  );
};
