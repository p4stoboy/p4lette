import {ColorCardProps, DragColorCardProps} from "./types/ColorCardProps";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {PaletteContext} from "./context/PaletteContext";
import { HexColorPicker} from "react-colorful";
import {UseClickOutside} from "./functions/use_click_outside";


export const ColorCard = (props: DragColorCardProps) => {
    return (
    <div className="color-card" style={{ backgroundColor: props.hex, color: props.font_color }} draggable
        onDragStart={(e) => props.drag_start(e, props.id)}
        onDragEnter={(e) => props.drag_enter(e, props.id)}
        onDragEnd={(e) => props.drop(e)}
    >
        <CardContent{...props} key={props.data_id}/>
    </div>
    );
};


export const CardContent = (props: ColorCardProps) => {
    const {update_color, palette} = useContext(PaletteContext);
    const popover = useRef();
    const [is_focus, toggle_focus] = useState(false);
    const [is_open, toggle] = useState(false);
    const close = useCallback(() => toggle(false), []);
    UseClickOutside(popover, close);

    const [select_cols, set_select_cols] = useState({bg: props.hex, font: props.font_color});
    useEffect(() => {
        set_select_cols({bg: props.hex, font: props.font_color});
    }, [palette]);

    return (
        // @ts-ignore
        <div className="card-item-container"
             style={{backgroundColor: props.hex, height:"100%", width: "100%"}}
            onMouseEnter={() => toggle_focus(true)}
            onMouseLeave={() => toggle_focus(false)}>
            {/*spacer*/}
            <div className="card-item-container" style={{backgroundColor: props.hex, height:"5%", width: "100%"}} />

            <div className="card-item-container" style={{backgroundColor: select_cols.bg, color: select_cols.font}}
                     onClick={() => toggle(true)}
                     onMouseEnter={() => set_select_cols({bg: props.font_color ? props.font_color : "#000", font: props.hex})}
                     onMouseLeave={() => set_select_cols({bg: props.hex, font: props.font_color ? props.font_color : "#000"})}
                >
                    <div className="card_item" style={{color: select_cols.font, fontSize: "1.5vh", height: "70%"}}>{props.name}</div>
                    <div className="card_item" style={{color: select_cols.font, height:"30%", fontSize: "1vh"}}>{props.hex}</div>
            </div>

            {is_open && (
                <div className="picker">
                    {/* @ts-ignore */}
                    <div className="popover" ref={popover}>
                        <HexColorPicker color={props.hex} onChange={(hex) => {update_color(props.id, hex, props.data_id)}} />
                    </div>
                </div>
            )}
            {is_focus && !is_open && <CardButtons {...props} key={props.data_id} />}
        </div>
    );
}

export const CardButtons = (props: ColorCardProps) => {
    const {delete_color} = useContext(PaletteContext);
    const [select_cols, set_select_cols] = useState({bg: props.hex, font: props.font_color});
    return (
        <div className="card_item" style={{height: "88%", justifyContent: "flex-end"}}>
            <div className="card_item" style={{fontSize: "3vh"}}>{(props.id + 1).toString()}</div>
        <div className="card_item"
             onClick={() => delete_color(props.id)}
             onMouseEnter={() => set_select_cols({bg: props.font_color ? props.font_color : "#000", font: props.hex})}
             onMouseLeave={() => set_select_cols({bg: props.hex, font: props.font_color ? props.font_color : "#000"})}
             style={{backgroundColor: select_cols.bg, color: select_cols.font, fontSize: "1.5vh", height: "15%", justifyContent: "center", borderRadius: "15px"}}>REMOVE</div>
        </div>
    );
}



