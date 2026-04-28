import {describe, expect, it} from "vitest";
import {get_color_card_props} from "./get_color_card_props";
import {resolve_template} from "./resolve_export_template";

const colors = [
    get_color_card_props("#AABBCC", 0, "first"),
    get_color_card_props("#112233", 1, "second"),
];
const names = ["SKY", "MIDNIGHT"];

describe("resolve_template", () => {
    it("resolves single color properties", () => {
        expect(resolve_template("main: $1.hex$", colors, names)).toBe('main: "#AABBCC"');
        expect(resolve_template("$2.name$", colors, names)).toBe('"MIDNIGHT"');
    });

    it("resolves full color objects", () => {
        const result = resolve_template("$1$", colors, names);

        expect(result).toContain('name: "SKY"');
        expect(result).toContain('hex: "#AABBCC"');
        expect(result).toContain("rgb:");
        expect(result).toContain("hsl:");
    });

    it("resolves arrays and all selectors", () => {
        expect(resolve_template("$[1,2].name$", colors, names)).toBe('[\n"SKY",\n"MIDNIGHT"\n]');
        expect(resolve_template("$[all].hex$", colors, names)).toBe('[\n"#AABBCC",\n"#112233"\n]');
    });

    it("resolves repeated tokens deterministically", () => {
        expect(resolve_template("$1.hex$/$1.hex$", colors, names)).toBe('"#AABBCC"/"#AABBCC"');
    });

    it("returns explicit messages for invalid ids and properties", () => {
        expect(resolve_template("$3.hex$", colors, names)).toBe("Color id {3} does not exist.");
        expect(resolve_template("$[1,3].hex$", colors, names)).toBe('[\n"#AABBCC",\nColor id {3} does not exist.\n]');
        expect(resolve_template("$1.cmyk$", colors, names)).toBe("Property {cmyk} does not exist.");
    });
});
