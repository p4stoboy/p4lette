import {ColorCard} from "./ColorCard";
import {Suspense, lazy, useRef} from "react";
import {usePalette} from "./context/PaletteContext";
import {ColorCardProps} from "./types/ColorCardProps";
import {Nav} from "./Nav";

const ExportTemplate = lazy(() =>
    import("./ExportTemplate").then((module) => ({default: module.ExportTemplate}))
);

export const App = () => {

    const {palette, names, reorderColor, export_visible} = usePalette();

    // drag logic from https://rootstack.com/en/blog/how-do-i-use-drag-and-drop-react
    const dragItem = useRef<number>();
    const dragOverItem = useRef<number>();

    const drag_start = (e: React.DragEvent<HTMLDivElement>, i: number) => {
        dragItem.current = i;
    };

    const drag_enter = (e: React.DragEvent<HTMLDivElement>, i: number) => {
        dragOverItem.current = i;
        if (dragItem.current === undefined || dragOverItem.current === undefined) return;
        reorderColor(dragItem.current, dragOverItem.current);
        dragItem.current = i;
    };

    const drop = () => {
        dragItem.current = undefined;
        dragOverItem.current = undefined;
    };

    const palette_cards = palette.map((color: ColorCardProps, i: number) => <ColorCard {...{...color, name: i < names.length ? names[i] : "Loading...", drag_start, drag_enter, drop}} key={color.data_id} />);
    return (
        <div className="global_container">
            <Nav />
            <div className="palette_container">
                {palette_cards}
            </div>
            {export_visible && (
                <Suspense fallback={null}>
                    <ExportTemplate />
                </Suspense>
            )}
        </div>
    );
}
