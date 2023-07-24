import {ColorCardProps} from "./types/ColorCardProps";
import {brightnessByColor} from "./functions/brightness";
import {useCallback, useContext, useRef, useState} from "react";
import {PaletteContext} from "./context/PaletteContext";
import { HexColorPicker} from "react-colorful";
import {UseClickOutside} from "./functions/use_click_outside";


export const ColorCard = (props: ColorCardProps) => {
    return (
    <div className="color-card" style={{ backgroundColor: props.hex, color: props.font_color }}>

      <h1>{props.name}</h1>
        <HexValue {...props} />
        <Picker {...props} />
        <DeleteButton {...props} key={props.id} />
        {/*<ClickToPick {...props} />*/}
    </div>
    );
};

export const DeleteButton = (props: ColorCardProps) => {
    const {delete_color} = useContext(PaletteContext);
    return (
        <div className="card_item" onClick={() => delete_color(props.id)} style={{color: props.font_color}}>REMOVE</div>
    );
}

//create your forceUpdate hook
export const Picker = (props: ColorCardProps) => {
    const {update_color} = useContext(PaletteContext);
        const popover = useRef();
        const [is_open, toggle] = useState(false);
        const close = useCallback(() => toggle(false), []);
        UseClickOutside(popover, close);


    return (
            <div className="picker">
                <div
                    className="swatch"
                    style={{ backgroundColor: props.hex, border: `3px solid ${props.font_color}` }}
                    onClick={() => toggle(true)}
                />

                {is_open && (
                    // @ts-ignore
                    <div className="popover" ref={popover}>
                        <HexColorPicker color={props.hex} onChange={(hex) => update_color(props.id, hex)} />
                    </div>
                )}
            </div>
        );
}

export const HexValue = (props: ColorCardProps) => {
    return (
        <div className="card_item" style={{color: props.font_color}}>{props.hex}</div>
    );
}
// export const ClickToPick = (props: ColorCardProps) => {
//     let picker_visible = false;
//     return (
//         <Picker {...props} />
//     );
// }
