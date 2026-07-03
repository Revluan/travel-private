import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Set env var before importing tools
process.env.NEXT_PUBLIC_AMAP_WEB_KEY = "test-key";

// Mock rate limiter to avoid test slowdowns
vi.mock("../rate-limiter", () => ({
  rateLimit: vi.fn().mockResolvedValue(undefined),
}));

import { searchAttractions } from "../search-attractions";
import { searchRestaurants } from "../search-restaurants";
import { searchHotels } from "../search-hotels";
import { getTransport } from "../get-transport";

beforeEach(() => {
  mockFetch.mockReset();
});

// Helper: cast tool return to non-stream form for testing
function asResult<T>(r: unknown): T {
  return r as T;
}

describe("searchAttractions", () => {
  it("calls Amap POI API with correct params", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ status: "1", pois: [] }),
    });

    await searchAttractions.execute!({ city: "上海", count: 5 }, {} as never);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("restapi.amap.com/v3/place/text");
    expect(url).toContain("key=test-key");
    expect(url).toContain("city=%E4%B8%8A%E6%B5%B7");
    expect(url).toContain("offset=5");
    expect(url).toContain("types=");
  });

  it("parses POI response correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          status: "1",
          pois: [
            {
              name: "外滩",
              address: "上海市黄浦区中山东一路",
              location: "121.4905,31.2400",
              biz_ext: { rating: "4.5" },
            },
          ],
        }),
    });

    const result = asResult<{
      success: boolean;
      attractions: { name: string; lng: number; lat: number }[];
    }>(
      await searchAttractions.execute!(
        { city: "上海", count: 10 },
        {} as never,
      ),
    );

    expect(result.success).toBe(true);
    expect(result.attractions).toHaveLength(1);
    expect(result.attractions[0].name).toBe("外滩");
    expect(result.attractions[0].lng).toBe(121.4905);
    expect(result.attractions[0].lat).toBe(31.24);
  });

  it("handles API error gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ status: "0", info: "INVALID_KEY" }),
    });

    const result = asResult<{ success: boolean; error: string }>(
      await searchAttractions.execute!(
        { city: "上海", count: 10 },
        {} as never,
      ),
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("INVALID_KEY");
  });

  it("includes keyword in search", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ status: "1", pois: [] }),
    });

    await searchAttractions.execute!(
      { city: "北京", keyword: "博物馆", count: 10 },
      {} as never,
    );

    const url = mockFetch.mock.calls[0][0] as string;
    expect(decodeURIComponent(url)).toContain("博物馆");
  });
});

describe("searchRestaurants", () => {
  it("calls Amap POI API with restaurant type", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ status: "1", pois: [] }),
    });

    await searchRestaurants.execute!(
      { city: "上海", count: 8 },
      {} as never,
    );

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("types=050000");
    expect(url).toContain("offset=8");
  });

  it("parses restaurant with pricing", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          status: "1",
          pois: [
            {
              name: "老正兴",
              address: "上海市黄浦区福州路",
              location: "121.48,31.23",
              biz_ext: { rating: "4.3", cost: "150" },
            },
          ],
        }),
    });

    const result = asResult<{
      success: boolean;
      restaurants: { name: string; avgPrice: string }[];
    }>(
      await searchRestaurants.execute!(
        { city: "上海", count: 10 },
        {} as never,
      ),
    );

    expect(result.success).toBe(true);
    expect(result.restaurants[0].name).toBe("老正兴");
    expect(result.restaurants[0].avgPrice).toBe("150");
  });

  it("uses cuisine keyword when provided", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ status: "1", pois: [] }),
    });

    await searchRestaurants.execute!(
      { city: "上海", cuisine: "本帮菜", count: 10 },
      {} as never,
    );

    const url = mockFetch.mock.calls[0][0] as string;
    expect(decodeURIComponent(url)).toContain("本帮菜");
  });
});

describe("searchHotels", () => {
  it("calls Amap POI API with hotel types", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ status: "1", pois: [] }),
    });

    await searchHotels.execute!({ city: "杭州", count: 5 }, {} as never);

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("types=100000");
  });

  it("parses hotel with price range", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          status: "1",
          pois: [
            {
              name: "杭州西湖希尔顿",
              address: "杭州市西湖区",
              location: "120.15,30.25",
              biz_ext: { rating: "4.7", cost: "800-1500" },
            },
          ],
        }),
    });

    const result = asResult<{
      success: boolean;
      hotels: { name: string; priceRange: string }[];
    }>(
      await searchHotels.execute!({ city: "杭州", count: 10 }, {} as never),
    );

    expect(result.success).toBe(true);
    expect(result.hotels[0].name).toBe("杭州西湖希尔顿");
    expect(result.hotels[0].priceRange).toBe("800-1500");
  });
});

describe("getTransport", () => {
  it("calls driving direction API", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          status: "1",
          route: { distance: "5000", duration: "600" },
        }),
    });

    const result = asResult<{
      success: boolean;
      distance: number;
      duration: number;
      distanceFormatted: string;
      durationFormatted: string;
    }>(
      await getTransport.execute!(
        { originLng: 121.4, originLat: 31.2, destLng: 121.5, destLat: 31.3, mode: "driving" },
        {} as never,
      ),
    );

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("direction/driving");
    expect(result.success).toBe(true);
    expect(result.distance).toBe(5000);
    expect(result.duration).toBe(600);
    expect(result.distanceFormatted).toBe("5.0公里");
    expect(result.durationFormatted).toBe("10分钟");
  });

  it("calls walking direction API", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          status: "1",
          route: { distance: "800", duration: "480" },
        }),
    });

    const result = asResult<{
      success: boolean;
      distanceFormatted: string;
      durationFormatted: string;
    }>(
      await getTransport.execute!(
        { originLng: 121.4, originLat: 31.2, destLng: 121.41, destLat: 31.21, mode: "walking" },
        {} as never,
      ),
    );

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("direction/walking");
    expect(result.distanceFormatted).toBe("800米");
    expect(result.durationFormatted).toBe("8分钟");
  });

  it("calls transit direction API with city", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          status: "1",
          route: { distance: "3000", duration: "1200" },
        }),
    });

    await getTransport.execute!(
      {
        originLng: 121.4, originLat: 31.2, destLng: 121.5, destLat: 31.3,
        mode: "transit", city: "上海",
      },
      {} as never,
    );

    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("direction/transit/integrated");
    expect(url).toContain("city=%E4%B8%8A%E6%B5%B7");
  });

  it("handles direction API error", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ status: "0", info: "SERVICE_UNAVAILABLE" }),
    });

    const result = asResult<{ success: boolean; error: string }>(
      await getTransport.execute!(
        { originLng: 1, originLat: 2, destLng: 3, destLat: 4, mode: "driving" },
        {} as never,
      ),
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("SERVICE_UNAVAILABLE");
  });
});
