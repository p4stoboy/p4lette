import { useCallback, useEffect, useState } from "react";
import { Provider } from "./context/PaletteContext";
import { PosterSkin } from "./skins/poster/PosterSkin";
import { TerminalSkin } from "./skins/terminal/TerminalSkin";
import { Skin } from "./skins/SkinSwitcher";

const SKIN_KEY = "p4lette_skin_v1";

const readInitialSkin = (): Skin => {
  if (typeof localStorage === "undefined") return "poster";
  try {
    const raw = localStorage.getItem(SKIN_KEY);
    return raw === "terminal" ? "terminal" : "poster";
  } catch {
    return "poster";
  }
};

export const App = () => {
  const [skin, setSkin] = useState<Skin>(readInitialSkin);

  useEffect(() => {
    try {
      localStorage.setItem(SKIN_KEY, skin);
    } catch {
      /* ignore */
    }
  }, [skin]);

  const toggleSkin = useCallback(
    () => setSkin((s) => (s === "poster" ? "terminal" : "poster")),
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      if (e.key === "t" || e.key === "T") {
        toggleSkin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSkin]);

  return (
    <Provider>
      {skin === "poster" ? (
        <PosterSkin onSwapSkin={toggleSkin} />
      ) : (
        <TerminalSkin onSwapSkin={toggleSkin} />
      )}
    </Provider>
  );
};
