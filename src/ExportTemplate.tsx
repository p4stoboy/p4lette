import {useContext} from "react";
import {PaletteContext} from "./context/PaletteContext";
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';


export const ExportTemplate = () => {
    const {export_template, resolved_template, setExportTemplate, setExportVisible, setResolvedTemplate, instructions, palette, names} = useContext(PaletteContext);

    return (
        <div className="export-container">
            <div className="export-header">
                <div className="export-link" style={{textAlign: "left", width: "100%"}} onClick={() => setExportVisible(false)}>x</div>
            </div>
            <div className="export-header">
                <div className="export-heading" style={{paddingTop: "2vh"}}>INPUT (EDIT THIS FIELD)</div>
                <div className="export-heading" style={{paddingTop: "2vh"}}>OUTPUT</div>
            </div>

            <div className="export-field">
                <CodeMirror
                    value={export_template}
                    height="100%"
                    extensions={[javascript({}), EditorView.lineWrapping]}
                    onChange={(s: string) => {setExportTemplate(s);}}
                />
            </div>
            <div className="export-field">
                <CodeMirror
                    value={resolved_template}
                    height="100%"
                    editable={false}
                    extensions={[javascript({}), EditorView.lineWrapping]}
                />
            </div>
            <div className="export-header" style={{}}>
                <div className="export-link" style={{color: "#FF0000"}} onClick={()=>setExportTemplate(instructions)}>RESET</div>
                <div className="export-link" onClick={(e) =>
                {
                    navigator.clipboard.writeText(resolved_template);
                    e.currentTarget.innerHTML = "COPIED!";
                }} onMouseLeave={(e) => e.currentTarget.innerHTML="COPY"}>COPY</div>
            </div>
        </div>
    );
}

