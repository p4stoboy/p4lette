import { afterEach, describe, expect, it, vi } from "vitest";
import { clearColorNameCache, getColorName } from "./get_color_card_props";

describe("getColorName", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    clearColorNameCache();
    vi.restoreAllMocks();
  });

  it("returns the name color.pizza reports", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ colors: [{ name: "Soft Blue" }] }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(getColorName("#AABBCC")).resolves.toBe("Soft Blue");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.color.pizza/v1/?values=aabbcc&list=default",
    );
  });

  it("falls back to the provided fallback when the API fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(getColorName("#aabbcc")).resolves.toBe("#aabbcc");
    await expect(getColorName("#aabbcc", "Existing Name")).resolves.toBe(
      "Existing Name",
    );
  });

  it("caches successful lookups by normalized hex", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ colors: [{ name: "Cached Blue" }] }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(getColorName("#aabbcc")).resolves.toBe("Cached Blue");
    await expect(getColorName("#AABBCC")).resolves.toBe("Cached Blue");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not cache failed lookups", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ colors: [{ name: "Recovered Blue" }] }),
      });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(getColorName("#aabbcc")).resolves.toBe("#aabbcc");
    await expect(getColorName("#aabbcc")).resolves.toBe("Recovered Blue");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
