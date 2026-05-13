import { useEffect, useState } from "react";
import { Provider } from "./context/PaletteContext";
import { PosterSkin } from "./skins/poster/PosterSkin";
import { PosterSharePage } from "./skins/poster/share/PosterSharePage";

const readPathname = (): string =>
  typeof window === "undefined" ? "/" : window.location.pathname;
const readSearch = (): string =>
  typeof window === "undefined" ? "" : window.location.search;

// A tiny path router: `/share?p=…` → the read-only share page (no Provider —
// it reads the palette straight from the search string); anything else → the
// editor. The `/share` path is exposed by a Netlify edge function so scrapers
// can read per-palette OG meta tags before any JS runs (see
// `netlify/edge-functions/share-html.ts` + `og-image.ts`). `popstate` covers
// back/forward navigation back into the share page from the editor.
export const App = () => {
  const [pathname, setPathname] = useState(readPathname);
  const [search, setSearch] = useState(readSearch);
  useEffect(() => {
    const onChange = () => {
      setPathname(readPathname());
      setSearch(readSearch());
    };
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
  }, []);

  if (pathname === "/share") return <PosterSharePage search={search} />;
  return (
    <Provider>
      <PosterSkin />
    </Provider>
  );
};
