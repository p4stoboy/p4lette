import { useState } from "react";
import { SmallBtn } from "./Backdrop";
import { SavedTemplate } from "../../functions/saved_templates";
import { EXPORT_PRESETS } from "../../functions/resolve_export_template";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
  isMobile: boolean;
  tpl: string;
  setTpl: (v: string) => void;
  resolved: string;
  copyLabel: string;
  templates: SavedTemplate[];
  onCopy: () => void;
  onReset: () => void;
  onSaveTemplate: () => void;
  onLoadTemplate: (body: string) => void;
  onDeleteTemplate: (id: string) => void;
  onClose: () => void;
}

const formatDate = (ms: number): string => new Date(ms).toLocaleDateString();

const labelRow = (ink: string) => ({
  padding: "8px 16px",
  borderBottom: `2px solid ${ink}`,
  fontFamily: POSTER.body,
  fontWeight: 700 as const,
  fontSize: 11,
  letterSpacing: "0.12em",
  flexShrink: 0,
});

export const PosterExportSheet = ({
  ink,
  bg,
  isMobile,
  tpl,
  setTpl,
  resolved,
  copyLabel,
  templates,
  onCopy,
  onReset,
  onSaveTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  onClose,
}: Props) => {
  const [loadOpen, setLoadOpen] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);

  return (
    <div
      style={
        isMobile
          ? {
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              background: bg,
              color: ink,
              borderTop: `${POSTER.borderW}px solid ${ink}`,
              height: "92%",
              animation: "maxSheetUp .3s cubic-bezier(.2,.7,.3,1)",
              display: "flex",
              flexDirection: "column",
              boxShadow: `0 -10px 0 ${POSTER.accent}`,
              zIndex: 50,
            }
          : {
              width: "100%",
              height: "100%",
              background: bg,
              color: ink,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: `-10px 0 0 ${POSTER.accent}`,
            }
      }
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
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            position: "relative",
          }}
        >
          <SmallBtn ink={ink} tall={isMobile} onClick={onSaveTemplate}>
            ♥ SAVE
          </SmallBtn>
          <SmallBtn
            ink={ink}
            tall={isMobile}
            onClick={() => {
              setPresetsOpen(false);
              setLoadOpen((v) => !v);
            }}
          >
            LOAD ▾
          </SmallBtn>
          <SmallBtn
            ink={ink}
            tall={isMobile}
            onClick={() => {
              setLoadOpen(false);
              setPresetsOpen((v) => !v);
            }}
          >
            PRESETS ▾
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

          {loadOpen && (
            <div
              role="menu"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                zIndex: 5,
                width: isMobile ? "min(280px, 86vw)" : 300,
                maxHeight: "min(52vh, 320px)",
                overflowY: "auto",
                background: bg,
                color: ink,
                border: `${POSTER.borderW}px solid ${ink}`,
                boxShadow: `0 8px 0 ${POSTER.accent}`,
              }}
            >
              <div
                style={{
                  ...labelRow(ink),
                  textTransform: "uppercase",
                }}
              >
                SAVED TEMPLATES [{templates.length}]
              </div>
              {templates.length === 0 ? (
                <div
                  style={{
                    fontFamily: POSTER.display,
                    fontSize: 22,
                    letterSpacing: "-0.01em",
                    opacity: 0.4,
                    padding: "16px 14px",
                  }}
                >
                  NOTHING SAVED.
                </div>
              ) : (
                templates.map((t, i) => (
                  <div
                    key={t.id}
                    style={{
                      display: "flex",
                      alignItems: "stretch",
                      borderBottom:
                        i === templates.length - 1
                          ? "none"
                          : `1px solid ${ink}`,
                    }}
                  >
                    <button
                      onClick={() => {
                        onLoadTemplate(t.body);
                        setLoadOpen(false);
                      }}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        textAlign: "left",
                        padding: "10px 12px",
                        border: "none",
                        background: "transparent",
                        color: ink,
                        cursor: "pointer",
                        touchAction: "manipulation",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: POSTER.display,
                          fontSize: 15,
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
                    </button>
                    <button
                      onClick={() => onDeleteTemplate(t.id)}
                      aria-label={`delete ${t.name}`}
                      style={{
                        flexShrink: 0,
                        width: isMobile ? 44 : 34,
                        border: "none",
                        borderLeft: `1px solid ${ink}`,
                        background: "transparent",
                        color: ink,
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: "pointer",
                        touchAction: "manipulation",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
          {presetsOpen && (
            <div
              role="menu"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                zIndex: 5,
                width: isMobile ? "min(280px, 86vw)" : 300,
                maxHeight: "min(52vh, 320px)",
                overflowY: "auto",
                background: bg,
                color: ink,
                border: `${POSTER.borderW}px solid ${ink}`,
                boxShadow: `0 8px 0 ${POSTER.accent}`,
              }}
            >
              <div style={{ ...labelRow(ink), textTransform: "uppercase" }}>
                PRESETS [{EXPORT_PRESETS.length}]
              </div>
              {EXPORT_PRESETS.map((p, i) => (
                <button
                  key={p.key}
                  onClick={() => {
                    onLoadTemplate(p.body);
                    setPresetsOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    minWidth: 0,
                    textAlign: "left",
                    padding: "10px 12px",
                    border: "none",
                    borderBottom:
                      i === EXPORT_PRESETS.length - 1
                        ? "none"
                        : `1px solid ${ink}`,
                    background: "transparent",
                    color: ink,
                    fontFamily: POSTER.display,
                    fontSize: 15,
                    letterSpacing: "0.02em",
                    cursor: "pointer",
                    touchAction: "manipulation",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr",
          gridTemplateRows: "1fr 1fr",
          minHeight: 0,
        }}
      >
        <div
          style={{
            borderBottom: `${POSTER.borderW}px solid ${ink}`,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <div style={labelRow(ink)}>INPUT — EDIT ME</div>
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
          <div style={labelRow(ink)}>OUTPUT — COPY ME</div>
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
};
