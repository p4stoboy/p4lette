import {MouseEvent, useContext} from "react";
import {PaletteContext} from "./context/PaletteContext";
import {resolve_template} from "./functions/resolve_export_template";
import {CopyBlock, a11yLight} from "react-code-blocks";


export const ExportTemplate = () => {
    const {export_template, setExportTemplate, palette, names} = useContext(PaletteContext);
    const resolved_template = resolve_template(export_template, palette, names);
    return (
        <div className="export-container">
            <div className="export-field">{export_template.split("\n").map((i, key) => {
                return <div key={key}>{i}</div>;
            })}</div>
            <div className="export-field"><CopyBlock text={resolved_template} language="javascript"
                                                     showLineNumbers={true} startingLineNumber={1} wrapLongLines={true}
                                                     copied={false}
                                                     theme={a11yLight}
                                                     codeBlock={false}
                                                     onCopy={(e) => {alert('copied!')}} /></div>
        </div>
    );
}