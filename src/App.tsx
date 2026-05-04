import { useEffect, useState } from "react";
import { Provider } from "./context/PaletteContext";
import { PosterSkin } from "./skins/poster/PosterSkin";
import { TerminalSkin } from "./skins/terminal/TerminalSkin";
import { Skin, SkinSwitcher } from "./skins/SkinSwitcher";

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
        setSkin((s) => (s === "poster" ? "terminal" : "poster"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Provider>
      {skin === "poster" ? <PosterSkin /> : <TerminalSkin />}
      <SkinSwitcher skin={skin} setSkin={setSkin} />
    </Provider>
  );
};
