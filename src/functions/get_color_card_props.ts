import {ColorCardProps} from "../types/ColorCardProps";
import {resolve_color} from "./color_converters";
import {brightnessByColor} from "./brightness";

const colorNameCache = new Map<string, string>();

const normalizeColorNameHex = (hex: string): string => {
    const withHash = hex.startsWith("#") ? hex : `#${hex}`;
    return withHash.toUpperCase();
};

export const clear_color_name_cache = () => {
    colorNameCache.clear();
};

export const get_color_name = async (hex: string, fallback: string = hex): Promise<string> => {
    const normalizedHex = normalizeColorNameHex(hex);
    const cachedName = colorNameCache.get(normalizedHex);
    if (cachedName) return cachedName;

    try {
        const nameres = await fetch(`https://api.color.pizza/v1/?values=${normalizedHex.slice(1)}`);
        if (!nameres.ok) return fallback.toUpperCase();

        const res = await nameres.json();
        const name = res?.colors?.[0]?.name;
        if (typeof name !== "string" || !name.trim()) return fallback.toUpperCase();

        const normalizedName = name.toUpperCase();
        colorNameCache.set(normalizedHex, normalizedName);
        return normalizedName;
    } catch {
        return fallback.toUpperCase();
    }
}

export const get_color_card_props = (hex: string, id: number, data_id: string): ColorCardProps => {
    const name = "Loading...";
    const brightness_val = brightnessByColor(hex);
    if (brightness_val === undefined) throw new Error(`bad hex: ${hex} passed to brightness test`);
    const font_color = brightness_val > 150 ? "#00000066" : "#FFFFFF66";
    return {...resolve_color(hex), name, id, hex: hex.toUpperCase(), font_color, data_id};
}
