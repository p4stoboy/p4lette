
export type ColorCardProps = {
    id: number,
    name: string,
    hex: string,
    rgb: {r: number, g: number, b: number},
    hsl: {h: number, s: number, l: number},
    font_color?: string,
}