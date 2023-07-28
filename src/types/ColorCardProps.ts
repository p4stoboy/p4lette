export type ColorCardProps = {
    [key: string]: any,
    id: number,
    data_id: string,
    name: string,
    hex: string,
    rgb: {r: number, g: number, b: number},
    hsl: {h: number, s: number, l: number},
    font_color?: string,
}

export type DragColorCardProps = ColorCardProps & {
    drag_start: (e: React.DragEvent<HTMLDivElement>, i: number) => void,
    drag_enter: (e: React.DragEvent<HTMLDivElement>, i: number) => void,
    drop: (e: React.DragEvent<HTMLDivElement>) => void,
}