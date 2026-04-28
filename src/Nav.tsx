import {useState} from "react";
import {usePalette} from "./context/PaletteContext";


export const Nav = () => {
    const {addColors, setExportVisible, resolved_template} = usePalette();
    const [copyLabel, setCopyLabel] = useState("COPY");
    const copyExport = async () => {
        try {
            await navigator.clipboard.writeText(resolved_template);
            setCopyLabel("COPIED!");
        } catch {
            setCopyLabel("COPY FAILED");
        }
    };

    return (
    <div className="options_container prevent-select" style={{fontSize: "1.5vh"}}>
        <div className = "link_container">
            <div className="link" style={{fontWeight: 700, fontSize: "2vh"}}>P4LETTE</div>
            <div className="link" onClick={copyExport} onMouseLeave={() => setCopyLabel("COPY")}>{copyLabel}</div>
            <div className="link" onClick={() => setExportVisible(true)}>EXPORT SETTINGS</div>
            <div className="link">ABOUT</div>
        </div>
        <div className = "link_container" />
        <div className = "link_container">
            <div className="link" onClick={() => addColors()} style={{fontWeight: 700}}>ADD COLOR +</div><br />
        </div>
    </div>
    );
}
