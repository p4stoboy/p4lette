import React from "react";
import ReactDOM from "react-dom/client";
import {App} from "./App";
import {Provider} from "./context/PaletteContext";

const el = document.getElementById("root");
if (!el) throw new Error("no root element");

// point react at root div
const root = ReactDOM.createRoot(el);

root.render(
    <Provider>
        <App />
    </Provider>
);