import { Backdrop } from "./Backdrop";
import { usePalette } from "../../context/PaletteContext";
import { useColorLists } from "../../hooks/use_color_lists";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  onClose: () => void;
}

export const PosterNamingSheet = ({ ink, bg, onClose }: Props) => {
  const { nameList, setNameList } = usePalette();
  const { lists, loading, error } = useColorLists(true);

  return (
    <Backdrop onClose={onClose} align="bottom">
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: bg,
          color: ink,
          borderTop: `${POSTER.borderW}px solid ${ink}`,
          width: "100%",
          maxWidth: "100vw",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            borderBottom: `${POSTER.borderW}px solid ${ink}`,
            padding: "16px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div style={{ fontFamily: POSTER.display, fontSize: 28 }}>NAMES</div>
          <button
            onClick={onClose}
            aria-label="close"
            style={{
              background: "none",
              border: `2px solid ${ink}`,
              fontSize: 22,
              cursor: "pointer",
              color: ink,
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
            padding: "8px 22px 14px",
            fontSize: 12,
            opacity: 0.7,
            borderBottom: `2px solid ${ink}`,
            flexShrink: 0,
          }}
        >
          color.pizza/{nameList}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading && (
            <div style={{ padding: "16px 22px", opacity: 0.6 }}>loading…</div>
          )}
          {error && (
            <div style={{ padding: "16px 22px", color: POSTER.accent }}>
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
                    padding: "16px 22px",
                    minHeight: 56,
                    textAlign: "left",
                    background: active ? ink : "transparent",
                    color: active ? bg : ink,
                    border: "none",
                    borderBottom: `1px solid ${ink}`,
                    fontFamily: POSTER.body,
                    fontSize: 16,
                    letterSpacing: "0.04em",
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
    </Backdrop>
  );
};
