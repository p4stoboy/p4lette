import { SmallBtn } from "./Backdrop";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  tpl: string;
  setTpl: (v: string) => void;
  resolved: string;
  copyLabel: string;
  onCopy: () => void;
  onReset: () => void;
  onClose: () => void;
}

export const PosterExportSheet = ({
  ink,
  bg,
  tpl,
  setTpl,
  resolved,
  copyLabel,
  onCopy,
  onReset,
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
      height: "62%",
      animation: "maxSheetUp .3s cubic-bezier(.2,.7,.3,1)",
      display: "flex",
      flexDirection: "column",
      boxShadow: `0 -10px 0 ${POSTER.accent}`,
    }}
  >
    <style>{`@keyframes maxSheetUp { from {transform: translateY(100%);} to{transform:translateY(0);}}`}</style>

    <div
      style={{
        borderBottom: `${POSTER.borderW}px solid ${ink}`,
        padding: "14px 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <span
          style={{
            fontFamily: POSTER.display,
            fontSize: 32,
            letterSpacing: "-0.02em",
          }}
        >
          EXPORT
        </span>
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
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <SmallBtn ink={ink} onClick={onReset}>
          RESET
        </SmallBtn>
        <button
          onClick={onCopy}
          style={{
            fontFamily: POSTER.display,
            fontSize: 18,
            letterSpacing: "0.04em",
            padding: "6px 18px",
            border: `${POSTER.borderW}px solid ${ink}`,
            background: POSTER.accent,
            color: POSTER.bg,
            cursor: "pointer",
          }}
        >
          {copyLabel}
        </button>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: `2px solid ${ink}`,
            color: ink,
            width: 34,
            height: 34,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 700,
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
        gridTemplateColumns: "1fr 1fr",
        minHeight: 0,
      }}
    >
      <div
        style={{
          borderRight: `${POSTER.borderW}px solid ${ink}`,
          display: "flex",
          flexDirection: "column",
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
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: "8px 16px",
            borderBottom: `2px solid ${ink}`,
            fontFamily: POSTER.body,
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.12em",
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
