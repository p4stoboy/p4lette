import ReactDOM from "react-dom/client";
import { App } from "./App";

const el = document.getElementById("root");
if (!el) throw new Error("no root element");

ReactDOM.createRoot(el).render(<App />);
