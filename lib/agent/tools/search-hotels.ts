import { tool } from "ai";
import { searchHotelsInput } from "./types";
import type { AmapPoi, PoiItem } from "./types";
import { rateLimit } from "./rate-limiter";

const getAmapKey = () => process.env.NEXT_PUBLIC_AMAP_WEB_KEY ?? "";

function mapPoi(poi: AmapPoi): PoiItem {
  const [lng, lat] = poi.location.split(",").map(Number);
  return {
    name: poi.name,
    address: poi.address || "",
    lng: lng ?? 0,
    lat: lat ?? 0,
    rating: poi.biz_ext?.rating,
    priceRange: poi.biz_ext?.cost,
  };
}

export async function doSearchHotels(params: {
  city: string;
  district?: string;
  count?: number;
}) {
  const { city, district, count } = params;
  const keywords = district ? `${district} 酒店` : "酒店";
  const url = new URL("https://restapi.amap.com/v3/place/text");
  url.searchParams.set("key", getAmapKey());
  url.searchParams.set("keywords", keywords);
  url.searchParams.set("types", "100000|100100|100200|100300"); // 酒店/宾馆/青旅/民宿
  url.searchParams.set("city", city);
  url.searchParams.set("offset", String(count ?? 10));
  url.searchParams.set("extensions", "all");

  await rateLimit();
  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== "1") {
    return {
      success: false,
      error: `高德 API 返回错误: ${data.info ?? "未知错误"}`,
      hotels: [],
    };
  }

  const hotels = (data.pois ?? []).map(mapPoi);
  return {
    success: true,
    count: hotels.length,
    hotels,
  };
}

export const searchHotels = tool({
  description:
    "搜索目的地城市的酒店住宿信息。返回酒店名称、地址、经纬度、评分和价格区间。用于推荐合适的住宿。",
  inputSchema: searchHotelsInput,
  execute: doSearchHotels,
});
