import { Backdrop, SmallBtn } from "./Backdrop";
import { SavedTemplate } from "../../functions/saved_templates";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
  list: SavedTemplate[];
  onClose: () => void;
  onLoad: (body: string) => void;
  onDelete: (id: string) => void;
}

const previewOf = (body: string): string => {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > 80 ? flat.slice(0, 80) + "…" : flat;
};

const formatDate = (ms: number): string => new Date(ms).toLocaleDateString();

export const PosterTemplatesDrawer = ({
  ink,
  bg,
  isMobile,
  list,
  onClose,
  onLoad,
  onDelete,
}: Props) => (
  <Backdrop onClose={onClose} align={isMobile ? "bottom" : "right"}>
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: bg,
        color: ink,
        borderLeft: isMobile ? "none" : `${POSTER.borderW}px solid ${ink}`,
        borderTop: isMobile ? `${POSTER.borderW}px solid ${ink}` : "none",
        width: isMobile ? "100%" : 460,
        height: isMobile ? "auto" : "100%",
        maxWidth: isMobile ? "100vw" : "94vw",
        maxHeight: isMobile ? "88vh" : "100%",
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
        <div style={{ fontFamily: POSTER.display, fontSize: 28 }}>
          TEMPLATES
        </div>
        <button
          onClick={onClose}
          aria-label="close"
          style={{
            background: "none",
            border: isMobile ? `2px solid ${ink}` : "none",
            fontSize: 22,
            cursor: "pointer",
            color: ink,
            width: isMobile ? 44 : undefined,
            height: isMobile ? 44 : undefined,
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
            NO SAVED
            <br />
            TEMPLATES
            <br />
            YET.
          </div>
        )}
        {list.map((t) => (
          <div
            key={t.id}
            style={{ marginBottom: 14, border: `2px solid ${ink}` }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderBottom: `2px solid ${ink}`,
                fontFamily: POSTER.mono,
                fontSize: 12,
                lineHeight: 1.45,
                background: "transparent",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                minHeight: isMobile ? 60 : 50,
              }}
            >
              {previewOf(t.body)}
            </div>
            <div
              style={{
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
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
                  {t.name}
                </div>
                <div
                  style={{
                    fontFamily: POSTER.mono,
                    fontSize: 11,
                    opacity: 0.6,
                  }}
                >
                  {formatDate(t.createdAt)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <SmallBtn
                  ink={ink}
                  tall={isMobile}
                  onClick={() => onLoad(t.body)}
                >
                  LOAD
                </SmallBtn>
                <SmallBtn
                  ink={ink}
                  tall={isMobile}
                  onClick={() => onDelete(t.id)}
                >
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
