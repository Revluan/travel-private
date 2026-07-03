import { NextRequest, NextResponse } from "next/server";

const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_WEB_KEY ?? "";

interface AmapPoi {
  name: string;
  address: string;
  location: string;
  tel?: string;
  biz_ext?: { rating?: string; cost?: string | unknown[]; opentime2?: string; level?: string };
  keytag?: string;
  rectag?: string;
  tag?: string | string[];
  photos?: { title: string; url: string }[];
  business_area?: string;
  website?: string;
  alias?: string;
}

export interface PlaceDetailResponse {
  notFound?: boolean;
  error?: string;
  name?: string;
  address?: string;
  location?: string;
  tel?: string;
  rating?: string;
  cost?: string;
  openTime?: string;
  level?: string;
  photos: { title: string; url: string }[];
  tags: string[];
  bizType?: string;
  website?: string;
  businessArea?: string;
}

function collectTags(poi: AmapPoi): string[] {
  const tags = new Set<string>();
  if (poi.keytag) tags.add(poi.keytag);
  if (poi.rectag) tags.add(poi.rectag);
  if (poi.biz_ext?.level) tags.add(`${poi.biz_ext.level}景区`);
  if (poi.alias) tags.add(poi.alias);
  if (poi.tag) {
    const tagVals = Array.isArray(poi.tag) ? poi.tag : poi.tag.split(",");
    tagVals.forEach((t: string) => { const v = t.trim(); if (v) tags.add(v); });
  }
  return [...tags];
}

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get("keyword");
  const city = req.nextUrl.searchParams.get("city");

  if (!keyword) {
    return NextResponse.json({ error: "缺少 keyword 参数" }, { status: 400 });
  }

  try {
    // Step 1: text search
    const searchUrl = new URL("https://restapi.amap.com/v3/place/text");
    searchUrl.searchParams.set("key", AMAP_KEY);
    searchUrl.searchParams.set("keywords", keyword);
    searchUrl.searchParams.set("offset", "1");
    if (city) searchUrl.searchParams.set("city", city);

    const searchRes = await fetch(searchUrl.toString());
    const searchData = await searchRes.json();

    if (searchData.status !== "1" || !searchData.pois?.length) {
      return NextResponse.json({ notFound: true });
    }

    const poiId = searchData.pois[0].id as string;

    // Step 2: detail
    const detailUrl = new URL("https://restapi.amap.com/v3/place/detail");
    detailUrl.searchParams.set("key", AMAP_KEY);
    detailUrl.searchParams.set("id", poiId);

    const detailRes = await fetch(detailUrl.toString());
    const detailData = await detailRes.json();

    if (detailData.status !== "1" || !detailData.pois?.length) {
      return NextResponse.json({ notFound: true });
    }

    const poi: AmapPoi = detailData.pois[0];

    const cost = typeof poi.biz_ext?.cost === "string" ? poi.biz_ext.cost : undefined;

    return NextResponse.json({
      name: poi.name,
      address: poi.address,
      location: poi.location,
      tel: poi.tel,
      rating: poi.biz_ext?.rating,
      cost,
      openTime: poi.biz_ext?.opentime2,
      level: poi.biz_ext?.level,
      photos: poi.photos ?? [],
      tags: collectTags(poi),
      website: poi.website,
      businessArea: poi.business_area,
    } satisfies PlaceDetailResponse);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "请求失败" },
      { status: 502 },
    );
  }
}
