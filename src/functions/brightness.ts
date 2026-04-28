type RGB = {r: number, g: number, b: number};

const calculateBrightness = ({r, g, b}: RGB): number => ((r * 299) + (g * 587) + (b * 114)) / 1000;

const parseHexColor = (color: string): RGB | undefined => {
    const value = color.trim();
    const result = (value.startsWith("#") ? /^#([a-f\d]{3}|[a-f\d]{6})$/i : /^([a-f\d]{6})$/i).exec(value);
    if (!result) return undefined;

    const hex = result[1].length === 3
        ? result[1].split("").map((char) => `${char}${char}`).join("")
        : result[1];

    return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
    };
};

const parseRgbColor = (color: string): RGB | undefined => {
    const result = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i.exec(color.trim());
    if (!result) return undefined;

    const rgb = {
        r: Number(result[1]),
        g: Number(result[2]),
        b: Number(result[3]),
    };

    return Object.values(rgb).every((value) => value >= 0 && value <= 255) ? rgb : undefined;
};

/**
 * Calculate brightness value by RGB or HEX color.
 * Returns a dark-to-light value from 0 to 255, or undefined for unsupported input.
 */
export function brightnessByColor(color: string): number | undefined {
    const rgb = parseHexColor(color) ?? parseRgbColor(color);
    return rgb ? calculateBrightness(rgb) : undefined;
}
