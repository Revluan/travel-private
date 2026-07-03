import { tool } from "ai";
import { getTransportInput } from "./types";
import type { AmapDirectionResponse, TransportResult, TransportStep } from "./types";
import { rateLimit } from "./rate-limiter";

const getAmapKey = () => process.env.NEXT_PUBLIC_AMAP_WEB_KEY ?? "";

const BASE_URLS: Record<string, string> = {
  driving: "https://restapi.amap.com/v3/direction/driving",
  walking: "https://restapi.amap.com/v3/direction/walking",
  transit: "https://restapi.amap.com/v3/direction/transit/integrated",
};

function mapSteps(data: AmapDirectionResponse): TransportStep[] {
  const path = data.route.paths?.[0];
  const steps = path?.steps ?? [];
  return steps.map((s) => ({
    instruction: s.instruction ?? "",
    road: s.road,
    distance: s.distance ? Number(s.distance) : undefined,
    duration: s.duration ? Number(s.duration) : undefined,
  }));
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}分钟`;
  const hours = Math.floor(mins / 60);
  const remain = mins % 60;
  return remain > 0 ? `${hours}小时${remain}分钟` : `${hours}小时`;
}

export const getTransport = tool({
  description:
    "查询两个地点之间的交通方式、距离和耗时。支持驾车(driving)、步行(walking)、公交(transit)三种模式。用于评估行程中两个地点之间的交通可行性。",
  inputSchema: getTransportInput,
  async execute({ originLng, originLat, destLng, destLat, mode, city }) {
    const baseUrl = BASE_URLS[mode];
    if (!baseUrl) {
      return { success: false, error: `不支持的交通方式: ${mode}` };
    }

    const url = new URL(baseUrl);
    url.searchParams.set("key", getAmapKey());
    url.searchParams.set("origin", `${originLng},${originLat}`);
    url.searchParams.set("destination", `${destLng},${destLat}`);

    if (mode === "transit" && city) {
      url.searchParams.set("city", city);
      url.searchParams.set("cityd", city);
    } else {
      url.searchParams.set("extensions", "all");
    }

    await rateLimit();
    const res = await fetch(url.toString());
    const data: AmapDirectionResponse = await res.json();
    console.log("[getTransport] request:", url.toString().replace(getAmapKey(), "***"));
    console.log("[getTransport] response:", JSON.stringify(data));

    if (data.status !== "1") {
      return {
        success: false,
        error: `高德路径规划失败: ${data.info ?? "未知错误"}`,
      };
    }

    if (data.count === "0") {
      return {
        success: false,
        error: "高德路径规划未找到路线，可能是坐标超出中国范围或两地距离过远",
      };
    }

    let distance: number;
    let duration: number;
    let taxiEstimate: string | undefined;

    if (mode === "transit") {
      distance = Number(data.route.distance ?? 0);
      duration = Number(data.route.transits?.[0]?.duration ?? 0);
      taxiEstimate = data.route.transits?.[0]?.cost
        ? `约${data.route.transits[0].cost}元`
        : undefined;
    } else {
      const path = data.route.paths?.[0];
      distance = Number(path?.distance ?? 0);
      duration = Number(path?.duration ?? 0);
    }

    const result: TransportResult = {
      distance,
      duration,
      mode,
      steps: mode === "transit" ? [] : mapSteps(data),
      taxiEstimate,
    };

    return {
      success: true,
      ...result,
      distanceFormatted:
        distance >= 1000
          ? `${(distance / 1000).toFixed(1)}公里`
          : `${distance}米`,
      durationFormatted: formatDuration(duration),
    };
  },
});
