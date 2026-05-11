import { Provider } from "./context/PaletteContext";
import { PosterSkin } from "./skins/poster/PosterSkin";

export const App = () => (
  <Provider>
    <PosterSkin />
  </Provider>
);
