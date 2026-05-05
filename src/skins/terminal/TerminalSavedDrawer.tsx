import { BrutBackdrop, BrutSmallBtn } from "./BrutBackdrop";
import { SavedPalette } from "../../functions/saved_palettes";
import { TERMINAL } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  accent: string;
  isMobile: boolean;
  list: SavedPalette[];
  onClose: () => void;
  onLoad: (hexes: string[]) => void;
  onDelete: (id: string) => void;
}

const EMPTY_LOG = `$ ls vault/
ls: no such directory.

> hit [W] to save
  the current palette.`;

export const TerminalSavedDrawer = ({
  ink,
  bg,
  accent,
  isMobile,
  list,
  onClose,
  onLoad,
  onDelete,
}: Props) => (
  <BrutBackdrop onClose={onClose} align={isMobile ? "bottom" : "right"}>
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: bg,
        color: ink,
        borderLeft: isMobile ? "none" : `${TERMINAL.borderW}px solid ${ink}`,
        borderTop: isMobile ? `${TERMINAL.borderW}px solid ${ink}` : "none",
        width: isMobile ? "100%" : 440,
        height: isMobile ? "auto" : "100%",
        maxWidth: isMobile ? "100vw" : "94vw",
        maxHeight: isMobile ? "88vh" : "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: isMobile ? "10px 14px" : "6px 14px",
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
          // VAULT.LS
        </span>
        <button
          onClick={onClose}
          aria-label="close"
          style={{
            background: "none",
            border: isMobile ? `${TERMINAL.borderW}px solid ${bg}` : "none",
            color: bg,
            cursor: "pointer",
            fontFamily: TERMINAL.mono,
            fontSize: 14,
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
          padding: "8px 14px",
          borderBottom: `${TERMINAL.borderW}px solid ${ink}`,
          fontSize: 10,
          opacity: 0.7,
          letterSpacing: "0.14em",
          flexShrink: 0,
        }}
      >
        {list.length} ENTRIES · LOCAL.STORAGE
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 12 }}>
        {list.length === 0 && (
          <div
            style={{
              padding: 22,
              fontSize: 12,
              opacity: 0.6,
              fontFamily: TERMINAL.mono,
            }}
          >
            <pre style={{ margin: 0 }}>{EMPTY_LOG}</pre>
          </div>
        )}
        {list.map((s) => (
          <div
            key={s.id}
            style={{
              marginBottom: 10,
              border: `${TERMINAL.borderW}px solid ${ink}`,
            }}
          >
            <div style={{ display: "flex", height: isMobile ? 64 : 44 }}>
              {s.hexes.map((h, i) => (
                <div key={i} style={{ flex: 1, background: h }} />
              ))}
            </div>
            <div
              style={{
                padding: "8px 10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                borderTop: `${TERMINAL.borderW}px solid ${ink}`,
                fontSize: 10,
                letterSpacing: "0.1em",
              }}
            >
              <span style={{ opacity: 0.7 }}>
                {new Date(s.createdAt).toISOString().slice(0, 10)} ·{" "}
                {s.hexes.length} cols
              </span>
              <span style={{ display: "flex", gap: 6 }}>
                <BrutSmallBtn
                  ink={ink}
                  accent={accent}
                  tall={isMobile}
                  onClick={() => onLoad(s.hexes)}
                >
                  LOAD
                </BrutSmallBtn>
                <BrutSmallBtn
                  ink={ink}
                  accent={accent}
                  tall={isMobile}
                  onClick={() => onDelete(s.id)}
                >
                  RM
                </BrutSmallBtn>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </BrutBackdrop>
);
