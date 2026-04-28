import {ColorCardProps, DragColorCardProps} from "./types/ColorCardProps";
import {useCallback, useRef, useState} from "react";
import {usePalette} from "./context/PaletteContext";
import { HexColorPicker} from "react-colorful";
import {useClickOutside} from "./functions/use_click_outside";


export const ColorCard = (props: DragColorCardProps) => {
    return (
    <div className="color-card" style={{ backgroundColor: props.hex, color: props.font_color }} draggable
        onDragStart={(e) => props.drag_start(e, props.id)}
        onDragEnter={(e) => props.drag_enter(e, props.id)}
        onDragEnd={(e) => props.drop(e)}
        onDragOver={(e) => e.preventDefault()}
    >
        <CardContent{...props} key={props.data_id}/>
    </div>
    );
};


export const CardContent = (props: ColorCardProps) => {
    const {updateColor} = usePalette();
    const popover = useRef<HTMLDivElement>(null);
    const [is_focus, toggle_focus] = useState(false);
    const [is_open, toggle] = useState(false);
    const close = useCallback(() => toggle(false), []);
    useClickOutside(popover, close);

    const [isSelectHover, setSelectHover] = useState(false);
    const select_cols = isSelectHover
        ? {bg: props.font_color, font: props.hex}
        : {bg: props.hex, font: props.font_color};

    return (
        <div className="card-item-container"
             style={{backgroundColor: props.hex, height:"100%", width: "100%"}}
            onMouseEnter={() => toggle_focus(true)}
            onMouseLeave={() => toggle_focus(false)}>
            {/*spacer*/}
            <div className="card-item-container" style={{backgroundColor: props.hex, height:"5%", width: "100%"}} />

            <div className="card-item-container" style={{backgroundColor: select_cols.bg, color: select_cols.font}}
                     onClick={() => toggle(true)}
                     onMouseEnter={() => setSelectHover(true)}
                     onMouseLeave={() => setSelectHover(false)}
                >
                    <div className="card_item" style={{color: select_cols.font, fontSize: "1.5vh", height: "70%"}}>{props.name}</div>
                    <div className="card_item" style={{color: select_cols.font, height:"30%", fontSize: "1vh"}}>{props.hex}</div>
            </div>

            {is_open && (
                <div className="picker">
                    <div className="popover" ref={popover}>
                        <HexColorPicker color={props.hex} onChange={(hex) => {updateColor(props.id, hex, props.data_id)}} />
                    </div>
                </div>
            )}
            {is_focus && !is_open && <CardButtons {...props} key={props.data_id} />}
        </div>
    );
}

export const CardButtons = (props: ColorCardProps) => {
    const {deleteColor} = usePalette();
    const [isRemoveHover, setRemoveHover] = useState(false);
    const select_cols = isRemoveHover
        ? {bg: props.font_color, font: props.hex}
        : {bg: props.hex, font: props.font_color};
    return (
        <div className="card_item" style={{height: "88%", justifyContent: "flex-end"}}>
            <div className="card_item" style={{fontSize: "2vh", height: "40%"}}>{(props.id + 1).toString()}</div>
            <div className="card_item" style={{fontSize: "1vh", height: "30%"}}>DRAG TO REORDER</div>
        <div className="card_item"
             onClick={() => deleteColor(props.id)}
             onMouseEnter={() => setRemoveHover(true)}
             onMouseLeave={() => setRemoveHover(false)}
             style={{backgroundColor: select_cols.bg, color: select_cols.font, fontSize: "1.5vh", height: "15%", justifyContent: "center", borderRadius: "15px"}}>REMOVE</div>
        </div>
    );
}
