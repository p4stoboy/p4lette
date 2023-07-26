import {useContext} from "react";
import {PaletteContext} from "./context/PaletteContext";


export const Nav = () => {
    const {add_color, export_visible, setExportVisible} = useContext(PaletteContext);
    return (
    <div className="options_container prevent-select" style={{fontSize: "1.5vh"}}>
        <div className = "link_container">
            <div className="link" style={{fontWeight: 700, fontSize: "2vh"}}>P4LETTE</div>
            <div className="link" onClick={(e) => setExportVisible(true)}>EXPORT</div>
            <div className="link">SETTINGS</div>
            <div className="link">ABOUT</div>
        </div>
        <div className = "link_container" />
        <div className = "link_container">
            <div className="link" onClick={() => add_color()} style={{fontWeight: 700}}>ADD COLOR +</div><br />
        </div>
    </div>
    );
}