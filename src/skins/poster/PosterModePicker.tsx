import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePalette } from "../../context/PaletteContext";
import { ColorMode } from "../../types/Colors";
import { POSTER } from "./tokens";

interface Props {
  ink: string;
  bg: string;
}

const MODES: { key: ColorMode; title: string; sample: string }[] = [
  { key: "hex", title: "HEX", sample: "6 digit hex" },
  { key: "rgb", title: "RGB", sample: "r g b" },
  { key: "hsl", title: "HSL", sample: "h s l" },
  { key: "hsv", title: "HSV", sample: "h s v" },
  { key: "oklch", title: "OKLCH", sample: "l c h" },
];

export const PosterModePicker = ({ ink, bg }: Props) => {
  const { colorMode, setColorMode } = usePalette();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<{ left: number; bottom: number } | null>(
    null,
  );

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

  const active = MODES.find((m) => m.key === colorMode) ?? MODES[0];

  return (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
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
          {active.title}
        </span>
        <span aria-hidden="true">·</span>
        <span style={{ opacity: 0.7 }}>{active.sample}</span>
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
            zIndex: 1000,
            minWidth: 200,
            boxShadow: `4px -4px 0 ${ink}`,
          }}
        >
          {MODES.map((m) => {
            const isActive = m.key === colorMode;
            return (
              <button
                key={m.key}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setColorMode(m.key);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: "8px 14px",
                  textAlign: "left",
                  background: isActive ? ink : "transparent",
                  color: isActive ? bg : ink,
                  border: "none",
                  font: "inherit",
                  letterSpacing: "inherit",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontWeight: 700 }}>{m.title}</span>
                <span style={{ opacity: 0.7 }}>{m.sample}</span>
              </button>
            );
          })}
        </div>
      )}
    </span>
  );
};
