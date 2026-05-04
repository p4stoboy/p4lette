import { PointerEvent as ReactPointerEvent, useCallback, useRef } from "react";

interface Options {
  onReorder: (from: number, to: number) => void;
  longPressMs?: number;
}

interface PointerHandlers {
  onPointerDown: (index: number) => (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
}

const findColumnIndex = (x: number, y: number): number | null => {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const wrap = (el as HTMLElement).closest(
    "[data-column-index]",
  ) as HTMLElement | null;
  if (!wrap) return null;
  const idx = parseInt(wrap.dataset.columnIndex ?? "", 10);
  return Number.isFinite(idx) ? idx : null;
};

export const useTouchDragReorder = ({
  onReorder,
  longPressMs = 350,
}: Options): PointerHandlers => {
  const fromRef = useRef<number | null>(null);
  const lastOverRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const onPointerDown = useCallback(
    (index: number) => (e: ReactPointerEvent<HTMLElement>) => {
      if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
      const target = e.currentTarget;
      const pid = e.pointerId;
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        fromRef.current = index;
        lastOverRef.current = index;
        pointerIdRef.current = pid;
        try {
          target.setPointerCapture(pid);
        } catch {
          /* ignore */
        }
      }, longPressMs);
    },
    [longPressMs],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (fromRef.current === null) {
        clearTimer();
        return;
      }
      e.preventDefault();
      const idx = findColumnIndex(e.clientX, e.clientY);
      if (
        idx !== null &&
        idx !== lastOverRef.current &&
        fromRef.current !== null
      ) {
        onReorder(fromRef.current, idx);
        fromRef.current = idx;
        lastOverRef.current = idx;
      }
    },
    [onReorder],
  );

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    clearTimer();
    if (pointerIdRef.current !== null) {
      try {
        e.currentTarget.releasePointerCapture(pointerIdRef.current);
      } catch {
        /* ignore */
      }
    }
    fromRef.current = null;
    lastOverRef.current = null;
    pointerIdRef.current = null;
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  };
};
