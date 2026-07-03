import { z } from "zod";

// Reusable input schemas for tools
export const cityInput = z.object({
  city: z.string().describe("城市名称，如 上海、北京"),
});

export const searchAttractionsInput = cityInput.extend({
  keyword: z.string().optional().describe("关键词筛选，如 博物馆、海滩"),
  count: z.number().default(10).describe("返回数量"),
});

export const searchRestaurantsInput = cityInput.extend({
  cuisine: z.string().optional().describe("菜系，如 本帮菜、川菜、日料"),
  count: z.number().default(10).describe("返回数量"),
});

export const searchHotelsInput = cityInput.extend({
  district: z.string().optional().describe("区域，如 南京路、西湖"),
  count: z.number().default(10).describe("返回数量"),
});

export const getTransportInput = z.object({
  originLng: z.number().describe("起点经度"),
  originLat: z.number().describe("起点纬度"),
  destLng: z.number().describe("终点经度"),
  destLat: z.number().describe("终点纬度"),
  mode: z.enum(["driving", "walking", "transit"]).default("driving").describe("交通方式"),
  city: z.string().optional().describe("城市名（transit 模式需要）"),
});

// Tool output types
export interface PoiItem {
  name: string;
  address: string;
  lng: number;
  lat: number;
  rating?: string;
  type?: string;
  avgPrice?: string;
  priceRange?: string;
}

export interface TransportStep {
  instruction: string;
  road?: string;
  distance?: number;
  duration?: number;
}

export interface TransportResult {
  distance: number; // meters
  duration: number; // seconds
  mode: string;
  steps: TransportStep[];
  taxiEstimate?: string;
}

// Amap API response types (partial, what we need)
export interface AmapPoiResponse {
  status: string;
  count: string;
  pois: AmapPoi[];
}

export interface AmapPoi {
  name: string;
  address: string;
  location: string; // "lng,lat"
  biz_ext?: { rating?: string; cost?: string };
  deep_info?: { avg_price?: string };
  type?: string;
}

export interface AmapDirectionResponse {
  status: string;
  route: {
    distance: string;
    duration: string;
    taxi_cost?: string;
    steps?: Array<{
      instruction: string;
      road?: string;
      distance?: string;
      duration?: string;
    }>;
    transits?: Array<{
      segments: Array<{
        bus?: { buslines: Array<{ name: string; type: string }> };
        walking?: { distance: string; duration: string };
        enter_name?: string;
        exit_name?: string;
      }>;
    }>;
  };
}
