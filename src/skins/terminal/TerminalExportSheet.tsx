import { BrutSmallBtn } from "./BrutBackdrop";
import { TERMINAL } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  accent: string;
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
      height: "60%",
      animation: "brutSheetUp .22s steps(5)",
      display: "flex",
      flexDirection: "column",
    }}
  >
    <style>{`@keyframes brutSheetUp { from {transform:translateY(100%);} to{transform:translateY(0);}}`}</style>
    <div
      style={{
        padding: "6px 14px",
        borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
        background: ink,
        color: bg,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em" }}>
        // EXPORT.PIPE
      </span>
      <span style={{ display: "flex", gap: 6 }}>
        <BrutSmallBtn ink={bg} accent={accent} onClick={onReset}>
          RESET
        </BrutSmallBtn>
        <button
          onClick={onCopy}
          style={{
            fontFamily: TERMINAL.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.14em",
            padding: "3px 12px",
            background: accent,
            color: "#000",
            border: "none",
            cursor: "pointer",
          }}
        >
          {copyLabel}
        </button>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: `${TERMINAL.borderW}px solid ${bg}`,
            color: bg,
            width: 22,
            height: 22,
            cursor: "pointer",
            fontFamily: TERMINAL.mono,
            fontSize: 12,
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
        gridTemplateColumns: "1fr 1fr",
        minHeight: 0,
      }}
    >
      <div
        style={{
          borderRight: `${TERMINAL.borderW}px solid ${ink}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "6px 12px",
            borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.14em",
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
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: "6px 12px",
            borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.14em",
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
