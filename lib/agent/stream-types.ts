import type { GeneratedDay, GeneratedItinerary } from "@/lib/types/trip";

export type AgentEvent =
  | PhaseEvent
  | DayGeneratedEvent
  | GeocodeResultEvent
  | RouteResultEvent
  | CompleteEvent
  | ErrorEvent;

export interface PhaseEvent {
  type: "phase";
  phase: "planning" | "geocoding" | "routing";
  message: string;
}

export interface DayGeneratedEvent {
  type: "day-generated";
  day: GeneratedDay;
  dayNumber: number;
  totalDays: number;
}

export interface GeocodeResultEvent {
  type: "geocode-result";
  title: string;
  success: boolean;
  lng?: number;
  lat?: number;
}

export interface RouteResultEvent {
  type: "route-result";
  from: string;
  to: string;
  success: boolean;
  mode?: string;
  duration?: string;
  distance?: string;
}

export interface CompleteEvent {
  type: "complete";
  itinerary: GeneratedItinerary;
}

export interface ErrorEvent {
  type: "error";
  message: string;
}

export const TOOL_LABELS: Record<string, string> = {
  searchAttractions: "搜索景点",
  searchRestaurants: "搜索餐厅",
  searchHotels: "搜索酒店",
  getTransport: "查询交通",
};

export function buildToolResultSummary(
  tool: string,
  result: Record<string, unknown>,
): string {
  const count = result.count as number | undefined;
  switch (tool) {
    case "searchAttractions":
      return count != null ? `找到 ${count} 个景点` : "未找到景点";
    case "searchRestaurants":
      return count != null ? `找到 ${count} 家餐厅` : "未找到餐厅";
    case "searchHotels":
      return count != null ? `找到 ${count} 家酒店` : "未找到酒店";
    case "getTransport":
      if (result.success && result.durationFormatted) {
        return `${result.durationFormatted}，${result.distanceFormatted}`;
      }
      return "查询完成";
    default:
      return "完成";
  }
}
