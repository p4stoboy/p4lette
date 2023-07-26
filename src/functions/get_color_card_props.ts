import {ColorCardProps} from "../types/ColorCardProps";
import {resolve_color} from "./color_converters";
import {brightnessByColor} from "./brightness";

export const get_color_name = async (hex: string): Promise<string> => {
    const nameres = await fetch(`https://api.color.pizza/v1/?values=${hex.slice(1)}`);
    if (!nameres.ok) throw new Error("Could not fetch color name");
    const res = await nameres.json();
    return res.colors[0].name.toUpperCase();
}
export const get_color_card_props = (hex: string, id: number, data_id: string): ColorCardProps => {
    const name = "Loading...";
    const brightness_val = brightnessByColor(hex);
    if (brightness_val === undefined) throw new Error(`bad hex: ${hex} passed to brightness test`);
    const font_color = brightness_val > 150 ? "#00000066" : "#FFFFFF66";
    return {...resolve_color(hex), name, id, hex: hex.toUpperCase(), font_color, data_id};
}