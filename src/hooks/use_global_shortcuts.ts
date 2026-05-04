import { useEffect, useRef } from "react";

export interface ShortcutHandlers {
  onShuffle?: () => void;
  onLock?: () => void;
  onExport?: () => void;
  onHarmony?: () => void;
  onAbout?: () => void;
  onEsc?: () => void;
}

export const useGlobalShortcuts = (handlers: ShortcutHandlers): void => {
  const ref = useRef(handlers);
  useEffect(() => {
    ref.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const inField =
        !!t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);
      if (inField && e.key !== "Escape") return;
      const h = ref.current;
      switch (e.key) {
        case " ":
          e.preventDefault();
          h.onShuffle?.();
          return;
        case "l":
        case "L":
          h.onLock?.();
          return;
        case "e":
        case "E":
          h.onExport?.();
          return;
        case "h":
        case "H":
          h.onHarmony?.();
          return;
        case "?":
          h.onAbout?.();
          return;
        case "Escape":
          h.onEsc?.();
          return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
};
