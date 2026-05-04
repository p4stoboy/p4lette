import { useEffect, useState } from "react";

interface Viewport {
  isMobile: boolean;
  isLandscape: boolean;
}

const MOBILE_MAX = 768;

const readViewport = (): Viewport => {
  if (typeof window === "undefined") {
    return { isMobile: false, isLandscape: true };
  }
  return {
    isMobile: window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches,
    isLandscape: window.matchMedia("(orientation: landscape)").matches,
  };
};

export const useViewport = (): Viewport => {
  const [state, setState] = useState<Viewport>(readViewport);

  useEffect(() => {
    const update = () => setState(readViewport());
    const mqlMobile = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const mqlOrient = window.matchMedia("(orientation: landscape)");
    mqlMobile.addEventListener("change", update);
    mqlOrient.addEventListener("change", update);
    return () => {
      mqlMobile.removeEventListener("change", update);
      mqlOrient.removeEventListener("change", update);
    };
  }, []);

  return state;
};
