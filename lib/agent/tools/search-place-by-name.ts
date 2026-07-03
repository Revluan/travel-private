import { rateLimit } from "./rate-limiter";

const getAmapKey = () => process.env.NEXT_PUBLIC_AMAP_WEB_KEY ?? "";

interface PlaceResult {
  name: string;
  address: string;
  lng: number;
  lat: number;
}

function stripSuffix(name: string): string | null {
  const suffixes = ["店", "餐厅", "酒家", "饭店", "菜馆", "食府", "小吃",
    "公园", "广场", "风景区", "景区", "旅游区", "度假区",
    "博物馆", "图书馆", "美术馆", "展览馆", "纪念馆",
    "中心", "大厦", "大楼",
  ];
  for (const suffix of suffixes) {
    if (name.endsWith(suffix) && name.length > suffix.length + 1) {
      return name.slice(0, -suffix.length);
    }
  }
  return null;
}

/** Search Amap POI by place name, return the first match or null. */
export async function searchPlaceByName(
  name: string,
  city: string,
): Promise<PlaceResult | null> {
  // Try original name first, then without suffix
  const queries = [name];
  const stripped = stripSuffix(name);
  if (stripped) queries.push(stripped);

  for (const query of queries) {
    const url = new URL("https://restapi.amap.com/v3/place/text");
    url.searchParams.set("key", getAmapKey());
    url.searchParams.set("keywords", query);
    url.searchParams.set("city", city);
    url.searchParams.set("offset", "1");
    url.searchParams.set("extensions", "base");

    await rateLimit();
    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status === "1" && Array.isArray(data.pois) && data.pois.length > 0) {
      const poi = data.pois[0];
      const [lng, lat] = (poi.location ?? "0,0").split(",").map(Number);
      return {
        name: poi.name ?? query,
        address: poi.address ?? "",
        lng: lng ?? 0,
        lat: lat ?? 0,
      };
    }
  }

  return null;
}
