import {useContext} from "react";
import {PaletteContext} from "./context/PaletteContext";
import {resolve_template} from "./functions/resolve_export_template";


export const Nav = () => {
    const {add_color, setExportVisible, setResolvedTemplate, resolved_template, export_template, palette, names} = useContext(PaletteContext);
    return (
    <div className="options_container prevent-select" style={{fontSize: "1.5vh"}}>
        <div className = "link_container">
            <div className="link" style={{fontWeight: 700, fontSize: "2vh"}}>P4LETTE</div>
            <div className="link" onClick={(e) =>
            {
                navigator.clipboard.writeText(resolved_template);
                e.currentTarget.innerHTML = "COPIED!";
            }} onMouseLeave={(e) => e.currentTarget.innerHTML="COPY"}>COPY</div>
            <div className="link" onClick={(e) => {setResolvedTemplate(resolve_template(export_template, palette, names)); setExportVisible(true)}}>EXPORT SETTINGS</div>
            <div className="link">ABOUT</div>
        </div>
        <div className = "link_container" />
        <div className = "link_container">
            <div className="link" onClick={() => add_color()} style={{fontWeight: 700}}>ADD COLOR +</div><br />
        </div>
    </div>
    );
}