import {ColorCardProps} from "../types/ColorCardProps";
import {ColorProperty} from "../types/Colors";


export const resolve_template = (template: string, colors: ColorCardProps[], names: string[]): string => {
    const named_colors = colors.map((color, i) => ({...color, name: names.length > i ? names[i] : ""}));
    try {
        return template.replace(/\$(.*?)\$/g, (_, key: string) => parse_input(key, named_colors));
    } catch (error) {
        return error instanceof Error ? error.message : "Could not resolve template";
    }
}

const parse_input = (input: string, colors: ColorCardProps[]): string => {
    const [selector, rawProperty, ...extra] = input.split('.');
    if (!selector || extra.length > 0) throw new Error(`Invalid color reference {${input}}.`);

    const property = rawProperty ? parse_property(rawProperty) : undefined;
    const is_array = selector.startsWith("[");
    const values = parse_selector(selector, is_array);
    const indexes = values.includes("all")
        ? colors.map((_, i) => ({index: i, label: `${i + 1}`}))
        : values.map((value) => ({index: parse_color_index(value), label: value}));

    const lines = indexes.map(({index, label}) => {
        const color = colors[index];
        return color ? resolve_line_attributes(color, property) : `Color id {${label}} does not exist.`;
    });

    return is_array ? `[\n${lines.join(',\n')}\n]` : lines[0];
}

const parse_selector = (selector: string, is_array: boolean): string[] => {
    if (!is_array) return [selector.trim().toLowerCase()];
    if (!selector.endsWith("]")) throw new Error(`Invalid color selector {${selector}}.`);

    const values = selector
        .slice(1, -1)
        .split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);

    if (values.length === 0) throw new Error(`Invalid color selector {${selector}}.`);
    return values;
};

const parse_color_index = (value: string): number => /^\d+$/.test(value) ? Number(value) - 1 : -1;

const supported_properties: ColorProperty[] = ["name", "hex", "rgb", "hsl"];

const parse_property = (property: string): ColorProperty => {
    const normalized = property.trim().toLowerCase();
    if (supported_properties.includes(normalized as ColorProperty)) return normalized as ColorProperty;
    throw new Error(`Property {${property}} does not exist.`);
};

const format_template_value = (value: unknown): string => JSON.stringify(value, null, 4)
    .split(" ")
    .map((part) => (part.startsWith("\"#") || /[A-Z]/.test(part)) ? part : part.replaceAll(/"/g, ""))
    .join(" ");

const resolve_line_attributes = (parsed_color: ColorCardProps, property: ColorProperty | undefined): string => {
    return property
        ? format_template_value(parsed_color[property])
        : format_template_value({
            name: parsed_color.name,
            hex: parsed_color.hex,
            hsl: parsed_color.hsl,
            rgb: parsed_color.rgb
        });
}
