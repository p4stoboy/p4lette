import {Colors} from "../types/Colors";

const normalizeHex = (color: string): string => {
    const hasHash = color.startsWith("#");
    const value = hasHash ? color : `#${color}`;
    const result = (hasHash ? /^#([a-f\d]{3}|[a-f\d]{6})$/i : /^#([a-f\d]{6})$/i).exec(value);

    if (!result) {
        throw new Error("Could not parse Hex Color");
    }

    const hex = result[1].length === 3
        ? result[1].split("").map((char) => `${char}${char}`).join("")
        : result[1];

    return `#${hex}`;
};

export function HexToHSL(hex: string): { h: number; s: number; l: number } {
    const normalizedHex = normalizeHex(hex);
    const result = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalizedHex);
    if (!result) throw new Error("Could not parse Hex Color");

    const rHex = parseInt(result[1], 16);
    const gHex = parseInt(result[2], 16);
    const bHex = parseInt(result[3], 16);

    const r = rHex / 255;
    const g = gHex / 255;
    const b = bHex / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h = (max + min) / 2;
    let s = h;
    let l = h;

    if (max === min) {
        // Achromatic
        return { h: 0, s: 0, l: Math.round(l * 100) };
    }

    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
        case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
        case g:
            h = (b - r) / d + 2;
            break;
        case b:
            h = (r - g) / d + 4;
            break;
    }
    h /= 6;

    s = s * 100;
    s = Math.round(s);
    l = l * 100;
    l = Math.round(l);
    h = Math.round(360 * h);

    return { h, s, l };
}

const hex2rgb = (hex: string) => {
    const normalizedHex = normalizeHex(hex);
    const r = parseInt(normalizedHex.slice(1, 3), 16);
    const g = parseInt(normalizedHex.slice(3, 5), 16);
    const b = parseInt(normalizedHex.slice(5, 7), 16);

    // return {r, g, b}
    return { r, g, b };
}

export const resolve_color = (color: string): Colors => {
    const hex = normalizeHex(color);
    const hsl = HexToHSL(hex);
    const rgb = hex2rgb(hex);
    return { hex, rgb, hsl };
}

// https://stackoverflow.com/a/5092872
export const random_hex = () => "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
