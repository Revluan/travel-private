import { tool } from "ai";
import { searchRestaurantsInput } from "./types";
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
    avgPrice: poi.biz_ext?.cost ?? poi.deep_info?.avg_price,
  };
}

export async function doSearchRestaurants(params: {
  city: string;
  cuisine?: string;
  count?: number;
}) {
  const { city, cuisine, count } = params;
  const keywords = cuisine ? `${cuisine}` : "美食";
  const url = new URL("https://restapi.amap.com/v3/place/text");
  url.searchParams.set("key", getAmapKey());
  url.searchParams.set("keywords", keywords);
  url.searchParams.set("types", "050000"); // 餐饮
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
      restaurants: [],
    };
  }

  const restaurants = (data.pois ?? []).map(mapPoi);
  return {
    success: true,
    count: restaurants.length,
    restaurants,
  };
}

export const searchRestaurants = tool({
  description:
    "搜索目的地城市的餐厅信息。返回餐厅名称、地址、经纬度、评分和人均价格。用于根据用户偏好推荐美食。",
  inputSchema: searchRestaurantsInput,
  execute: doSearchRestaurants,
});
