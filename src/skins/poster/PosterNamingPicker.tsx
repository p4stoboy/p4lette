import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePalette } from "../../context/PaletteContext";
import { useColorLists } from "../../hooks/use_color_lists";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
}

export const PosterNamingPicker = ({ ink, bg }: Props) => {
  const { nameList, setNameList } = usePalette();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<{ left: number; bottom: number } | null>(
    null,
  );
  const { lists, loading, error } = useColorLists(open);

  useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const r = btnRef.current?.getBoundingClientRect();
      if (r)
        setAnchor({ left: r.left, bottom: window.innerHeight - r.top + 6 });
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (popRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      color.pizza/
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          background: "transparent",
          border: "none",
          color: ink,
          font: "inherit",
          letterSpacing: "inherit",
          textTransform: "inherit",
          padding: 0,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>
          {nameList}
        </span>
        <span aria-hidden="true">▾</span>
      </button>
      {open && anchor && (
        <div
          ref={popRef}
          role="listbox"
          style={{
            position: "fixed",
            left: anchor.left,
            bottom: anchor.bottom,
            background: bg,
            color: ink,
            border: `${POSTER.borderW}px solid ${ink}`,
            fontFamily: POSTER.body,
            fontSize: 12,
            letterSpacing: "0.04em",
            textTransform: "none",
            maxHeight: 320,
            overflowY: "auto",
            zIndex: 1000,
            minWidth: 220,
            boxShadow: `4px -4px 0 ${ink}`,
          }}
        >
          {loading && (
            <div style={{ padding: "10px 14px", opacity: 0.6 }}>loading…</div>
          )}
          {error && (
            <div style={{ padding: "10px 14px", color: POSTER.accent }}>
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
                    setOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 14px",
                    textAlign: "left",
                    background: active ? ink : "transparent",
                    color: active ? bg : ink,
                    border: "none",
                    font: "inherit",
                    letterSpacing: "inherit",
                    cursor: "pointer",
                  }}
                >
                  {l.title}
                </button>
              );
            })}
        </div>
      )}
    </span>
  );
};
