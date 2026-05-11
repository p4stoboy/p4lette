import { SmallBtn } from "./Backdrop";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
  tpl: string;
  setTpl: (v: string) => void;
  resolved: string;
  copyLabel: string;
  onCopy: () => void;
  onReset: () => void;
  onSaveTemplate: () => void;
  onClose: () => void;
}

export const PosterExportSheet = ({
  ink,
  bg,
  isMobile,
  tpl,
  setTpl,
  resolved,
  copyLabel,
  onCopy,
  onReset,
  onSaveTemplate,
  onClose,
}: Props) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      background: bg,
      color: ink,
      borderTop: `${POSTER.borderW}px solid ${ink}`,
      height: isMobile ? "92%" : "62%",
      animation: "maxSheetUp .3s cubic-bezier(.2,.7,.3,1)",
      display: "flex",
      flexDirection: "column",
      boxShadow: `0 -10px 0 ${POSTER.accent}`,
      zIndex: 50,
    }}
  >
    <style>{`@keyframes maxSheetUp { from {transform: translateY(100%);} to{transform:translateY(0);}}`}</style>

    <div
      style={{
        borderBottom: `${POSTER.borderW}px solid ${ink}`,
        padding: isMobile ? "12px 14px" : "14px 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        flexWrap: isMobile ? "wrap" : "nowrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <span
          style={{
            fontFamily: POSTER.display,
            fontSize: isMobile ? 26 : 32,
            letterSpacing: "-0.02em",
          }}
        >
          EXPORT
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
            $1.hex$ · $[1,3].name$ · $[all].hex$
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <SmallBtn ink={ink} tall={isMobile} onClick={onSaveTemplate}>
          ♥ SAVE
        </SmallBtn>
        <SmallBtn ink={ink} tall={isMobile} onClick={onReset}>
          RESET
        </SmallBtn>
        <button
          onClick={onCopy}
          style={{
            fontFamily: POSTER.display,
            fontSize: isMobile ? 16 : 18,
            letterSpacing: "0.04em",
            padding: isMobile ? "10px 16px" : "6px 18px",
            border: `${POSTER.borderW}px solid ${ink}`,
            background: POSTER.accent,
            color: POSTER.bg,
            cursor: "pointer",
            minHeight: isMobile ? 44 : undefined,
            touchAction: "manipulation",
          }}
        >
          {copyLabel}
        </button>
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
            touchAction: "manipulation",
          }}
        >
          ×
        </button>
      </div>
    </div>

    <div
      style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gridTemplateRows: isMobile ? "1fr 1fr" : "1fr",
        minHeight: 0,
      }}
    >
      <div
        style={{
          borderRight: isMobile ? "none" : `${POSTER.borderW}px solid ${ink}`,
          borderBottom: isMobile ? `${POSTER.borderW}px solid ${ink}` : "none",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <div
          style={{
            padding: "8px 16px",
            borderBottom: `2px solid ${ink}`,
            fontFamily: POSTER.body,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.12em",
            flexShrink: 0,
          }}
        >
          INPUT — EDIT ME
        </div>
        <textarea
          value={tpl}
          onChange={(e) => setTpl(e.target.value)}
          spellCheck={false}
          style={{
            flex: 1,
            padding: 16,
            border: "none",
            outline: "none",
            resize: "none",
            fontFamily: POSTER.mono,
            fontSize: 13,
            lineHeight: 1.55,
            background: "transparent",
            color: ink,
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div
          style={{
            padding: "8px 16px",
            borderBottom: `2px solid ${ink}`,
            fontFamily: POSTER.body,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.12em",
            flexShrink: 0,
          }}
        >
          OUTPUT — COPY ME
        </div>
        <pre
          style={{
            flex: 1,
            padding: 16,
            margin: 0,
            overflow: "auto",
            fontFamily: POSTER.mono,
            fontSize: 13,
            lineHeight: 1.55,
            background: "transparent",
            color: ink,
            whiteSpace: "pre-wrap",
          }}
        >
          {resolved}
        </pre>
      </div>
    </div>
  </div>
);
