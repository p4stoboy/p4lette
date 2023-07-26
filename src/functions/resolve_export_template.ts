import {ColorCardProps} from "../types/ColorCardProps";


export const resolve_template = (template: string, colors: ColorCardProps[], names: string[]): string => {
    const named_colors = colors.map((color, i) => ({...color, name: names.length > i ? names[i] : ""}));
    const regex = "\%.*?\%";
    let result = template;
    let match = template.match(regex);
    let value;
    while (match) {
        const key = match[0].slice(1, -1);
        try {
            value = parse_input(key, named_colors);
        } catch (e: any) {
            return e.message;
        }
        result = result.replace(match[0], value);
        match = result.match(regex);
    }
    return result;
}

const parse_input = (input: string, colors: ColorCardProps[]): string => {
    const is_array = input[0] === '[';
    const split = input.split('.')[0] !== '' ? input.split('.') : [input];
    console.log(split);
    let res = is_array ? "[\n" : "";
    const values = is_array ? split[0].slice(1, -1).split(',').map(x => x.toLowerCase()) : [split[0].toLowerCase()];
    console.log(values);
    const is_all = values.includes("all");
    const indexes = is_all ? colors.map((_, i) => i) : values.map(x => parseInt(x) - 1);
    const property = split.length > 1 ? split[1].toLowerCase() : undefined;
    for (let i = 0; i < indexes.length; i++) {
        const index = indexes[i];
        const color = colors[index];
        if (!color) throw new Error(`Color id {${index+1}} does not exist.`);
        const parsed_color = {...color, "rgb": {r: color.rgb.r.toFixed(2), g: color.rgb.g.toFixed(2), b: color.rgb.b.toFixed(2)}};
        // @ts-ignore
        res += resolve_line_attributes(parsed_color, property);
        if (i < indexes.length - 1) res += ',\n';
    }
    if (is_array) res += '\n]';
    return res;
}


const resolve_line_attributes = (parsed_color: ColorCardProps, property: string | undefined): string => {
    return property
        ? JSON.stringify(parsed_color[property], null, 4).split(" ").map(x => x.startsWith("\"#") ? x : x.replaceAll(/"/g, "")).join(" ")
        : JSON.stringify(
        {
            name: parsed_color.name,
            hex: parsed_color.hex,
            hsl: parsed_color.hsl,
            rgb: parsed_color.rgb},
            null, 4).split(" ").map(x => x.startsWith("\"#") ? x : x.replaceAll(/"/g, "")).join(" ")
}