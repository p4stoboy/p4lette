import { useCallback, useState } from "react";

// Play an exit animation before a panel closes. Call `requestClose` instead of
// the raw close (e.g. from a `×` button): it flips `closing` true, the element
// re-renders with the reverse keyframe, and when that animation finishes
// `onAnimationEnd` (wire it to the same element) calls `onDone`. The `closing`
// guard means an entrance animation finishing first is harmless. If you never
// wire `onAnimationEnd` to an actually-animating element, `requestClose` would
// never resolve — so the caller should fall back to `onDone` directly where
// there's no animation (e.g. the desktop side-panel slot animates instead).
export const useExitAnimation = (onDone: () => void) => {
  const [closing, setClosing] = useState(false);
  const requestClose = useCallback(() => setClosing(true), []);
  const onAnimationEnd = useCallback(() => {
    if (closing) onDone();
  }, [closing, onDone]);
  return { closing, requestClose, onAnimationEnd };
};
