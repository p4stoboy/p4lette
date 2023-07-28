import {ColorCard} from "./ColorCard";
import {useContext, useRef} from "react";
import {PaletteContext} from "./context/PaletteContext";
import {ColorCardProps} from "./types/ColorCardProps";
import {Nav} from "./Nav";
import {ExportTemplate} from "./ExportTemplate";

export const App = () => {

    const {palette, names, setPalette, setNames, trigger, doTrigger, export_visible} = useContext(PaletteContext);

    // drag logic from https://rootstack.com/en/blog/how-do-i-use-drag-and-drop-react
    const dragItem = useRef<number>();
    const dragOverItem = useRef<number>();

    const drag_start = (e: React.DragEvent<HTMLDivElement>, i: number) => {
        dragItem.current = i;
    };

    const drag_enter = (e: React.DragEvent<HTMLDivElement>, i: number) => {
        dragOverItem.current = i;
        const new_palette = [...palette];
        const new_names = [...names];
        if (dragItem.current === undefined || dragOverItem.current === undefined) throw new Error('drag index not set');
        const dragged_content = new_palette[dragItem.current];
        const dragged_name = new_names[dragItem.current];
        new_palette.splice(dragItem.current, 1);
        new_palette.splice(dragOverItem.current, 0, dragged_content);
        new_names.splice(dragItem.current, 1);
        new_names.splice(dragOverItem.current, 0, dragged_name);
        const res = new_palette.map((color: ColorCardProps, i: number) => ({...color, id: i}));
        setPalette(res);
        setNames(new_names);
        dragItem.current = i;
    };

    const drop = (e: React.DragEvent<HTMLDivElement>) => {
        dragItem.current = undefined;
        dragOverItem.current = undefined;
        doTrigger(trigger+1);
    };

    const palette_cards = palette.map((color: ColorCardProps, i: number) => <ColorCard {...{...color, name: i < names.length ? names[i] : "Loading...", drag_start, drag_enter, drop}} key={color.data_id} />);
    return (
        <div className="global_container">
            <Nav />
            <div className="palette_container">
                {palette_cards}
            </div>
            {export_visible && <ExportTemplate />}
        </div>
    );
}

