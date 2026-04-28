import {afterEach, describe, expect, it, vi} from "vitest";
import {clear_color_name_cache, get_color_card_props, get_color_name} from "./get_color_card_props";

describe("get_color_name", () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
        globalThis.fetch = originalFetch;
        clear_color_name_cache();
        vi.restoreAllMocks();
    });

    it("returns an uppercase color name from the API", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({colors: [{name: "soft blue"}]}),
        });
        globalThis.fetch = fetchMock as unknown as typeof fetch;

        await expect(get_color_name("#AABBCC")).resolves.toBe("SOFT BLUE");
        expect(fetchMock).toHaveBeenCalledWith("https://api.color.pizza/v1/?values=AABBCC");
    });

    it("falls back when the color name API fails", async () => {
        const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
        globalThis.fetch = fetchMock as unknown as typeof fetch;

        await expect(get_color_name("#aabbcc")).resolves.toBe("#AABBCC");
        await expect(get_color_name("#aabbcc", "existing name")).resolves.toBe("EXISTING NAME");
    });

    it("caches successful color name lookups by normalized hex", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({colors: [{name: "cached blue"}]}),
        });
        globalThis.fetch = fetchMock as unknown as typeof fetch;

        await expect(get_color_name("#aabbcc")).resolves.toBe("CACHED BLUE");
        await expect(get_color_name("#AABBCC")).resolves.toBe("CACHED BLUE");
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("does not cache failed lookups", async () => {
        const fetchMock = vi.fn()
            .mockRejectedValueOnce(new Error("offline"))
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({colors: [{name: "recovered blue"}]}),
            });
        globalThis.fetch = fetchMock as unknown as typeof fetch;

        await expect(get_color_name("#aabbcc")).resolves.toBe("#AABBCC");
        await expect(get_color_name("#aabbcc")).resolves.toBe("RECOVERED BLUE");
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});

describe("get_color_card_props", () => {
    it("creates display props for readable light and dark colors", () => {
        expect(get_color_card_props("#FFFFFF", 0, "white").font_color).toBe("#00000066");
        expect(get_color_card_props("#000000", 1, "black").font_color).toBe("#FFFFFF66");
    });

    it("throws for invalid hex colors", () => {
        expect(() => get_color_card_props("bad", 0, "bad")).toThrow("bad hex: bad passed to brightness test");
    });
});
