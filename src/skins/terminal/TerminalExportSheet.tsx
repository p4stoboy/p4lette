import { BrutSmallBtn } from "./BrutBackdrop";
import { TERMINAL } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  accent: string;
  isMobile: boolean;
  tpl: string;
  setTpl: (v: string) => void;
  resolved: string;
  copyLabel: string;
  onCopy: () => void;
  onReset: () => void;
  onClose: () => void;
}

export const TerminalExportSheet = ({
  ink,
  bg,
  accent,
  isMobile,
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
      borderTop: `${TERMINAL.borderW}px solid ${ink}`,
      height: isMobile ? "92%" : "60%",
      animation: "brutSheetUp .22s steps(5)",
      display: "flex",
      flexDirection: "column",
      zIndex: 50,
    }}
  >
    <style>{`@keyframes brutSheetUp { from {transform:translateY(100%);} to{transform:translateY(0);}}`}</style>
    <div
      style={{
        padding: isMobile ? "8px 14px" : "6px 14px",
        borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
        background: ink,
        color: bg,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        flexWrap: isMobile ? "wrap" : "nowrap",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em" }}>
        // EXPORT.PIPE
      </span>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <BrutSmallBtn ink={bg} accent={accent} tall={isMobile} onClick={onReset}>
          RESET
        </BrutSmallBtn>
        <button
          onClick={onCopy}
          style={{
            fontFamily: TERMINAL.mono,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.14em",
            padding: isMobile ? "10px 16px" : "3px 12px",
            background: accent,
            color: "#000",
            border: "none",
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
            border: `${TERMINAL.borderW}px solid ${bg}`,
            color: bg,
            width: isMobile ? 44 : 22,
            height: isMobile ? 44 : 22,
            cursor: "pointer",
            fontFamily: TERMINAL.mono,
            fontSize: 14,
            touchAction: "manipulation",
          }}
        >
          ×
        </button>
      </span>
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
          borderRight: isMobile ? "none" : `${TERMINAL.borderW}px solid ${ink}`,
          borderBottom: isMobile ? `${TERMINAL.borderW}px solid ${ink}` : "none",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <div
          style={{
            padding: "6px 12px",
            borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.14em",
            flexShrink: 0,
          }}
        >
          $ INPUT — STDIN
        </div>
        <textarea
          value={tpl}
          onChange={(e) => setTpl(e.target.value)}
          spellCheck={false}
          style={{
            flex: 1,
            padding: 14,
            border: "none",
            outline: "none",
            resize: "none",
            fontFamily: TERMINAL.mono,
            fontSize: 12,
            lineHeight: 1.55,
            background: "transparent",
            color: ink,
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div
          style={{
            padding: "6px 12px",
            borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.14em",
            flexShrink: 0,
          }}
        >
          $ OUTPUT — STDOUT
        </div>
        <pre
          style={{
            flex: 1,
            padding: 14,
            margin: 0,
            overflow: "auto",
            fontFamily: TERMINAL.mono,
            fontSize: 12,
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
