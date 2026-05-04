import { Backdrop, SmallBtn } from "./Backdrop";
import { SavedPalette } from "../../functions/saved_palettes";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  list: SavedPalette[];
  onClose: () => void;
  onLoad: (hexes: string[]) => void;
  onDelete: (id: string) => void;
}

export const PosterSavedDrawer = ({
  ink,
  bg,
  list,
  onClose,
  onLoad,
  onDelete,
}: Props) => (
  <Backdrop onClose={onClose} align="right">
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: bg,
        color: ink,
        borderLeft: `${POSTER.borderW}px solid ${ink}`,
        width: 460,
        height: "100%",
        maxWidth: "94vw",
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
        <div style={{ fontFamily: POSTER.display, fontSize: 28 }}>VAULT</div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: 22,
            cursor: "pointer",
            color: ink,
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
        {list.length} SAVED · STORED LOCALLY
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {list.length === 0 && (
          <div
            style={{
              fontFamily: POSTER.display,
              fontSize: 36,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              padding: "40px 6px",
              opacity: 0.4,
            }}
          >
            NOTHING
            <br />
            HERE
            <br />
            YET.
          </div>
        )}
        {list.map((s) => (
          <div
            key={s.id}
            style={{ marginBottom: 14, border: `2px solid ${ink}` }}
          >
            <div style={{ display: "flex", height: 60 }}>
              {s.hexes.map((h, i) => (
                <div key={i} style={{ flex: 1, background: h }} />
              ))}
            </div>
            <div
              style={{
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: `2px solid ${ink}`,
              }}
            >
              <div
                style={{ fontFamily: POSTER.mono, fontSize: 11, opacity: 0.7 }}
              >
                {new Date(s.createdAt).toLocaleDateString()} · {s.hexes.length}{" "}
                colors
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <SmallBtn ink={ink} onClick={() => onLoad(s.hexes)}>
                  LOAD
                </SmallBtn>
                <SmallBtn ink={ink} onClick={() => onDelete(s.id)}>
                  DEL
                </SmallBtn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Backdrop>
);
