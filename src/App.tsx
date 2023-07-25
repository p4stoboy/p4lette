// a component
import {ColorCard} from "./ColorCard";
import {useContext, useEffect} from "react";
import {PaletteContext} from "./context/PaletteContext";
import {ColorCardProps} from "./types/ColorCardProps";
import {Nav} from "./Nav";

export const App = () => {

    const {palette, names} = useContext(PaletteContext);
    const palette_cards = palette.map((color: ColorCardProps, i: number) => <ColorCard {...{...color, name: i < names.length ? names[i] : "Loading..."}} key={i} />);
    return (
        <div className="global_container">
            <Nav />
            <div className="palette_container">
                {palette_cards}
            </div>

        </div>
    );
}

