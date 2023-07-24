import {Colors} from "../types/Colors";

export function HexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (!result) {
        throw new Error("Could not parse Hex Color");
    }

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
        return { h: 0, s: 0, l };
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

export function HSLToRGB(hsl: {
    h: number;
    s: number;
    l: number;
}): { r: number; g: number; b: number } {
    const { h, s, l } = hsl;

    const hDecimal = h / 100;
    const sDecimal = s / 100;
    const lDecimal = l / 100;

    let r, g, b;

    if (s === 0) {
        return { r: lDecimal, g: lDecimal, b: lDecimal };
    }

    const HueToRGB = (p: number, q: number, t:number ) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    let q =
        lDecimal < 0.5
            ? lDecimal * (1 + sDecimal)
            : lDecimal + sDecimal - lDecimal * sDecimal;
    let p = 2 * lDecimal - q;

    r = HueToRGB(p, q, hDecimal + 1 / 3);
    g = HueToRGB(p, q, hDecimal);
    b = HueToRGB(p, q, hDecimal - 1 / 3);

    return { r: r * 255, g: g * 255, b: b * 255 };
}

export const resolve_color = (color: string): Colors => {
    const hex = color.startsWith("#") ? color : `#${color}`;
    const hsl = HexToHSL(hex);
    const rgb = HSLToRGB(hsl);
    return { hex, rgb, hsl };
}

// https://stackoverflow.com/a/5092872
export const random_hex = () => "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
