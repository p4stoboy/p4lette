import { Backdrop, SmallBtn } from "./Backdrop";
import { SavedPalette } from "../../functions/saved_palettes";
import { useExitAnimation } from "../../hooks/use_exit_animation";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
  list: SavedPalette[];
  onClose: () => void;
  onSave: () => void;
  onLoad: (hexes: string[]) => void;
  onDelete: (id: string) => void;
}

// SAVE / LOAD. On desktop it docks in PosterSkin's content-row side-panel slot
// (a bare flex column — the slot supplies the borderLeft + the slide-in); on
// mobile it's a Backdrop-backed bottom sheet.
export const PosterSavedDrawer = ({
  ink,
  bg,
  isMobile,
  list,
  onClose,
  onSave,
  onLoad,
  onDelete,
}: Props) => {
  const { closing, requestClose, onAnimationEnd } = useExitAnimation(onClose);
  const body = (
    <div
      onClick={(e) => e.stopPropagation()}
      onAnimationEnd={isMobile ? onAnimationEnd : undefined}
      style={
        isMobile
          ? {
              background: bg,
              color: ink,
              borderTop: `${POSTER.borderW}px solid ${ink}`,
              width: "100%",
              height: "auto",
              maxWidth: "100vw",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              animation: closing
                ? "savedSheetDown .2s cubic-bezier(.4,0,.6,1) forwards"
                : "savedSheetUp .26s cubic-bezier(.2,.7,.3,1)",
            }
          : {
              background: bg,
              color: ink,
              width: "100%",
              height: "100%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }
      }
    >
      <style>{`@keyframes savedSheetUp { from { transform: translateY(100%); } } @keyframes savedSheetDown { to { transform: translateY(100%); } }`}</style>
      <div
        style={{
          borderBottom: `${POSTER.borderW}px solid ${ink}`,
          padding: isMobile ? "16px 22px" : "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontFamily: POSTER.display,
            fontSize: isMobile ? 28 : 34,
            letterSpacing: "-0.02em",
          }}
        >
          SAVE / LOAD
        </div>
        <button
          onClick={isMobile ? requestClose : onClose}
          aria-label="close"
          style={{
            background: "none",
            border: `2px solid ${ink}`,
            color: ink,
            width: isMobile ? 44 : 34,
            height: isMobile ? 44 : 34,
            fontSize: isMobile ? 22 : 18,
            fontWeight: 700,
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          ×
        </button>
      </div>
      <div
        style={{
          padding: isMobile ? "12px 18px" : "10px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          borderBottom: `2px solid ${ink}`,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          {list.length} SAVED · LOCAL
        </span>
        <SmallBtn ink={ink} tall={isMobile} onClick={onSave}>
          ♥ SAVE PALETTE
        </SmallBtn>
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
            <div style={{ display: "flex", height: isMobile ? 80 : 60 }}>
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
                gap: 8,
                borderTop: `2px solid ${ink}`,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontFamily: POSTER.display,
                    fontSize: 16,
                    letterSpacing: "0.02em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.name}
                </div>
                <div
                  style={{
                    fontFamily: POSTER.mono,
                    fontSize: 11,
                    opacity: 0.6,
                  }}
                >
                  {new Date(s.createdAt).toLocaleDateString()} ·{" "}
                  {s.hexes.length} colors
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <SmallBtn
                  ink={ink}
                  tall={isMobile}
                  onClick={() => onLoad(s.hexes)}
                >
                  LOAD
                </SmallBtn>
                <SmallBtn
                  ink={ink}
                  tall={isMobile}
                  onClick={() => onDelete(s.id)}
                >
                  DEL
                </SmallBtn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return isMobile ? (
    <Backdrop onClose={requestClose} align="bottom">
      {body}
    </Backdrop>
  ) : (
    body
  );
};
