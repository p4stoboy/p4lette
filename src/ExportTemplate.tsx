import {useState} from "react";
import {usePalette} from "./context/PaletteContext";
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';


export const ExportTemplate = () => {
    const {export_template, resolved_template, setExportTemplate, setExportVisible, instructions} = usePalette();
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
                <div className="export-link" onClick={copyExport} onMouseLeave={() => setCopyLabel("COPY")}>{copyLabel}</div>
            </div>
        </div>
    );
}
