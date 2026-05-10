import { afterEach, describe, expect, it, vi } from "vitest";
import { getColorNames } from "./get_color_card_props";

describe("getColorNames", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("makes one batched request with the default list and noduplicates", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        colors: [{ name: "Soft Blue" }, { name: "Warm Red" }],
      }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(getColorNames(["#AABBCC", "#cc3300"])).resolves.toEqual([
      "Soft Blue",
      "Warm Red",
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.color.pizza/v1/?values=aabbcc,cc3300&noduplicates=true&list=bestOf",
    );
  });

  it("uses the provided list and url-encodes it", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ colors: [{ name: "X" }] }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await getColorNames(["#aabbcc"], { list: "sanzoWadaI" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.color.pizza/v1/?values=aabbcc&noduplicates=true&list=sanzoWadaI",
    );
  });

  it("returns an empty array without fetching when given no hexes", async () => {
    const fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(getColorNames([])).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back per index when the API fails", async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValue(new Error("offline")) as unknown as typeof fetch;

    await expect(
      getColorNames(["#aabbcc", "#cc3300"], {
        fallbacks: ["Existing Name", undefined as unknown as string],
      }),
    ).resolves.toEqual(["Existing Name", "#cc3300"]);
  });

  it("falls back per index when the API returns no name for a slot", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ colors: [{ name: "Soft Blue" }, { name: "" }] }),
    }) as unknown as typeof fetch;

    await expect(
      getColorNames(["#aabbcc", "#cc3300"], {
        fallbacks: ["Soft Blue", "Previous Red"],
      }),
    ).resolves.toEqual(["Soft Blue", "Previous Red"]);
  });

  it("re-fetches every call (no caching)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ colors: [{ name: "Soft Blue" }] }),
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await getColorNames(["#aabbcc"]);
    await getColorNames(["#aabbcc"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
