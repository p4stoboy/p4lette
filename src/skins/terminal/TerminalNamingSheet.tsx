import { BrutBackdrop } from "./BrutBackdrop";
import { usePalette } from "../../context/PaletteContext";
import { useColorLists } from "../../hooks/use_color_lists";
import { TERMINAL } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  accent: string;
  onClose: () => void;
}

export const TerminalNamingSheet = ({ ink, bg, accent, onClose }: Props) => {
  const { nameList, setNameList } = usePalette();
  const { lists, loading, error } = useColorLists(true);

  return (
    <BrutBackdrop onClose={onClose} align="bottom">
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: bg,
          color: ink,
          borderTop: `${TERMINAL.borderW}px solid ${ink}`,
          width: "100%",
          maxWidth: "100vw",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          fontFamily: TERMINAL.mono,
        }}
      >
        <div
          style={{
            padding: "10px 14px",
            borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
            background: ink,
            color: bg,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em" }}
          >
            // NAMES.LS
          </span>
          <button
            onClick={onClose}
            aria-label="close"
            style={{
              background: "none",
              border: `${TERMINAL.borderW}px solid ${bg}`,
              color: bg,
              cursor: "pointer",
              fontFamily: TERMINAL.mono,
              fontSize: 14,
              width: 44,
              height: 44,
              touchAction: "manipulation",
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            padding: "8px 14px",
            borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
            fontSize: 10,
            opacity: 0.7,
            letterSpacing: "0.14em",
            flexShrink: 0,
          }}
        >
          color.pizza/<span style={{ color: accent }}>{nameList}</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading && (
            <div style={{ padding: "12px 14px", opacity: 0.6 }}>loading…</div>
          )}
          {error && (
            <div style={{ padding: "12px 14px", color: TERMINAL.alert }}>
              load failed
            </div>
          )}
          {!loading &&
            !error &&
            lists.map((l) => {
              const active = l.key === nameList;
              return (
                <button
                  key={l.key}
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setNameList(l.key);
                    onClose();
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px 18px",
                    minHeight: 52,
                    textAlign: "left",
                    background: active ? accent : "transparent",
                    color: active ? "#000" : ink,
                    border: "none",
                    borderBottom: `1px dashed ${ink}`,
                    fontFamily: TERMINAL.mono,
                    fontSize: 14,
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    touchAction: "manipulation",
                  }}
                >
                  {l.title}
                </button>
              );
            })}
        </div>
      </div>
    </BrutBackdrop>
  );
};
