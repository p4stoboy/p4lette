import { useEffect, useState } from "react";
import { Provider } from "./context/PaletteContext";
import { PosterSkin } from "./skins/poster/PosterSkin";
import { PosterSharePage } from "./skins/poster/share/PosterSharePage";
import { isShareHash } from "./skins/poster/share/parseShareHash";

const readHash = (): string =>
  typeof window === "undefined" ? "" : window.location.hash;

// A tiny hash router: `…#/share?p=…` → the read-only share page (no Provider —
// it reads the palette straight from the hash); anything else → the editor.
export const App = () => {
  const [hash, setHash] = useState(readHash);
  useEffect(() => {
    const onHashChange = () => setHash(readHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (isShareHash(hash)) return <PosterSharePage hash={hash} />;
  return (
    <Provider>
      <PosterSkin />
    </Provider>
  );
};
