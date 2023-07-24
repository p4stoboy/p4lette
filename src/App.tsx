// a component
import {ColorCard} from "./ColorCard";
import {useContext} from "react";
import {PaletteContext} from "./context/PaletteContext";
import {ColorCardProps} from "./types/ColorCardProps";

export const App = () => {

    const {palette, add_color, names} = useContext(PaletteContext);
    // const add_color = async () => {
    //     const new_color_props = await get_color_card_props("#FFFFFF", palette.length);
    //     setPalette([...palette, new_color_props]);
    // }
    //
    // useEffect(() => {
    //     (async () => {
    //         const new_color_props = await get_color_card_props("#FFFFFF", palette.length);
    //         setPalette([...palette, new_color_props]);
    //     })();
    // }, []);
    const palette_cards = palette.map((color: ColorCardProps, i: number) => <ColorCard {...{...color, name: i < names.length ? names[i] : "Loading..."}} key={i} />);

    return (
        <div className="global_container">
            <div className="palette_container">
                {palette_cards}
            </div>
            <div className="options_container">
                <div className = "template"></div>
                <div className = "template"></div>
                <button className = "add_button" onClick={() => add_color()}>+</button>
            </div>
        </div>
    );
}

