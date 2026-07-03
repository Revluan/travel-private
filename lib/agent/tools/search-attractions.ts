import { tool } from "ai";
import { searchAttractionsInput } from "./types";
import type { AmapPoi, PoiItem } from "./types";
import { rateLimit } from "./rate-limiter";

const getAmapKey = () => process.env.NEXT_PUBLIC_AMAP_WEB_KEY ?? "";

const ATTRACTION_TYPES = [
  "110000", // 风景名胜
  "110100", // 公园广场
  "140000", // 博物馆
  "140400", // 展览馆
  "140600", // 美术馆
  "141000", // 图书馆
  "140900", // 文化宫
  "140500", // 会展中心
  "140700", // 科技馆
  "140800", // 天文馆
].join("|");

function mapPoi(poi: AmapPoi): PoiItem {
  const [lng, lat] = poi.location.split(",").map(Number);
  return {
    name: poi.name,
    address: poi.address || "",
    lng: lng ?? 0,
    lat: lat ?? 0,
    rating: poi.biz_ext?.rating,
    type: poi.type,
  };
}

export async function doSearchAttractions(params: {
  city: string;
  keyword?: string;
  count?: number;
}) {
  const { city, keyword, count } = params;
  const keywords = keyword ? `${keyword} 景点` : "景点";
  const url = new URL("https://restapi.amap.com/v3/place/text");
  url.searchParams.set("key", getAmapKey());
  url.searchParams.set("keywords", keywords);
  url.searchParams.set("types", ATTRACTION_TYPES);
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
      attractions: [],
    };
  }

  const attractions = (data.pois ?? []).map(mapPoi);
  return {
    success: true,
    count: attractions.length,
    attractions,
  };
}

export const searchAttractions = tool({
  description:
    "搜索目的地城市的景点信息。返回景点名称、地址、经纬度和评分。用于了解目的地有哪些值得去的景点。",
  inputSchema: searchAttractionsInput,
  execute: doSearchAttractions,
});
