import { generateText } from "ai";
import { defaultModel } from "@/lib/ai/deepseek";
import { generatedItinerarySchema } from "@/lib/ai/schemas";
import type { GeneratedItinerary } from "@/lib/types/trip";
import type { TripConfig, GeneratedDay, PlannedActivity } from "@/lib/types/trip";
import { PLAN_PROMPT } from "./prompt";
import { searchPlaceByName } from "./tools/search-place-by-name";
import { getTransport } from "./tools/get-transport";
import type {
  AgentEvent,
  PhaseEvent,
  DayGeneratedEvent,
  GeocodeResultEvent,
  RouteResultEvent,
} from "./stream-types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function createAgentSSE(
  config: TripConfig,
  signal?: AbortSignal,
): Promise<Response> {
  const totalDays = config.days;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let aborted = false;

      function emit(event: AgentEvent) {
        if (aborted || signal?.aborted) return;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
        );
      }

      try {
        // ==========================================
        // Phase 1: LLM generates full itinerary
        // ==========================================
        emit({
          type: "phase",
          phase: "planning",
          message: "正在规划行程...",
        } satisfies PhaseEvent);

        const city = normalizeCityForSearch(config.destination.name);
        const userPrompt = buildPlanPrompt(config);

        console.log("[agent] plan prompt length:", userPrompt.length);

        const result = await generateText({
          model: defaultModel,
          system: PLAN_PROMPT,
          prompt: userPrompt,
          temperature: 0.7,
          maxOutputTokens: 8000,
          abortSignal: signal,
          providerOptions: {
            openai: { responseFormat: { type: "json_object" } },
          },
        });

        console.log("[agent] response text length:", result.text.length);
        console.log("[agent] response text ends with:", JSON.stringify(result.text.slice(-80)));

        const itinerary = parseItinerary(result.text);

        if (!itinerary?.days?.length) {
          console.error("[agent] failed to parse itinerary, raw text:", result.text.slice(0, 1000));
          throw new Error("行程生成失败：无法解析模型返回的行程数据");
        }

        console.log(`[agent] generated ${itinerary.days.length} days`);
        console.log("[agent] overview:", itinerary.overview);

        // Emit day-generated for each day
        for (const day of itinerary.days) {
          emit({
            type: "day-generated",
            day,
            dayNumber: day.dayNumber,
            totalDays,
          } satisfies DayGeneratedEvent);
          await delay(100);
        }

        // ==========================================
        // Phase 2: Geocode activities via Amap keyword search
        // ==========================================
        emit({
          type: "phase",
          phase: "geocoding",
          message: "正在查找地点坐标...",
        } satisfies PhaseEvent);

        const allActivities: { activity: PlannedActivity }[] = [];
        for (const day of itinerary.days) {
          for (const activity of day.activities) {
            allActivities.push({ activity });
          }
        }

        console.log(`[agent] geocoding ${allActivities.length} activities`);

        await Promise.all(
          allActivities.map(async ({ activity }) => {
            if (signal?.aborted) return;
            try {
              const place = await searchPlaceByName(activity.title, city);
              if (place) {
                activity.lng = place.lng;
                activity.lat = place.lat;
              }
              emit({
                type: "geocode-result",
                title: activity.title,
                success: !!place,
                lng: place?.lng,
                lat: place?.lat,
              } satisfies GeocodeResultEvent);
            } catch {
              emit({
                type: "geocode-result",
                title: activity.title,
                success: false,
              } satisfies GeocodeResultEvent);
            }
          }),
        );

        console.log("[agent] geocoding complete");

        // ==========================================
        // Phase 3: Calculate routes between consecutive activities
        // ==========================================
        emit({
          type: "phase",
          phase: "routing",
          message: "正在计算交通...",
        } satisfies PhaseEvent);

        let routeCount = 0;
        for (const day of itinerary.days) {
          for (let i = 0; i < day.activities.length - 1; i++) {
            if (signal?.aborted) break;
            const current = day.activities[i];
            const next = day.activities[i + 1];

            if (
              current.lng != null && current.lat != null &&
              next.lng != null && next.lat != null
            ) {
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const transportResult: any = await (getTransport.execute as any)({
                  originLng: current.lng,
                  originLat: current.lat,
                  destLng: next.lng,
                  destLat: next.lat,
                  mode: "driving",
                  city,
                }, { abortSignal: signal });

                if (transportResult.success) {
                  current.transportTo = {
                    mode: "驾车",
                    duration: transportResult.durationFormatted ?? "",
                    distance: transportResult.distanceFormatted ?? "",
                  };
                }

                emit({
                  type: "route-result",
                  from: current.title,
                  to: next.title,
                  success: !!transportResult.success,
                  mode: "驾车",
                  duration: transportResult.durationFormatted,
                  distance: transportResult.distanceFormatted,
                } satisfies RouteResultEvent);
                routeCount++;
              } catch {
                emit({
                  type: "route-result",
                  from: current.title,
                  to: next.title,
                  success: false,
                } satisfies RouteResultEvent);
              }
              await delay(100);
            }
          }
        }

        console.log(`[agent] routed ${routeCount} connections`);

        // ==========================================
        // Complete
        // ==========================================
        emit({
          type: "complete",
          itinerary,
        });
      } catch (err) {
        if (signal?.aborted) {
          emit({ type: "error", message: "用户取消了行程规划" });
        } else {
          console.error("[agent] unhandled error:", err);
          emit({
            type: "error",
            message:
              err instanceof Error ? err.message : "行程规划失败，请重试",
          });
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function normalizeCityForSearch(name: string): string {
  return name
    .replace(/城区$/, "")
    .replace(/新区$/, "")
    .replace(/地区$/, "")
    .replace(/市$/, "")
    .replace(/省$/, "")
    .replace(/自治区$/, "")
    .replace(/特别行政区$/, "")
    .trim();
}

function parseItinerary(text: string): GeneratedItinerary | null {
  // Strip markdown code fences if present
  let json = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Find the first { and last } to extract JSON object
  const start = json.indexOf("{");
  const end = json.lastIndexOf("}");
  if (start !== -1 && end > start) {
    json = json.slice(start, end + 1);
  }

  // Try full parse first
  try {
    const parsed = JSON.parse(json) as Record<string, unknown>;
    normalizeActivityTypes(parsed);
    return generatedItinerarySchema.parse(parsed) as GeneratedItinerary;
  } catch (err) {
    if (err instanceof SyntaxError) {
      const match = (err as Error).message.match(/position\s*(\d+)/i);
      const pos = match ? Number(match[1]) : -1;
      console.error("[agent] JSON syntax error at position", pos, ":", json.slice(Math.max(0, pos - 30), pos + 30));
    } else {
      // zod validation error — log which field was wrong
      console.error("[agent] schema validation error:", err instanceof Error ? err.message : String(err));
    }
  }

  // Recovery: JSON was truncated — walk back to the last complete activity
  const lastComplete = findLastCompleteActivity(json);
  if (lastComplete) {
    try {
      const recovered = JSON.parse(lastComplete) as Record<string, unknown>;
      normalizeActivityTypes(recovered);
      return generatedItinerarySchema.parse(recovered) as GeneratedItinerary;
    } catch {
      // fall through
    }
  }

  console.error("[agent] JSON parse failed, raw:", json.slice(0, 400));
  return null;
}

/** Map common model type variants to valid enum values. */
function normalizeActivityTypes(obj: Record<string, unknown>) {
  const days = obj.days as Array<Record<string, unknown>> | undefined;
  if (!days) return;
  for (const day of days) {
    const activities = day.activities as Array<Record<string, unknown>> | undefined;
    if (!activities) continue;
    for (const a of activities) {
      const raw = a.type as string;
      const map: Record<string, string> = {
        restaurant: "meal",
        meal: "meal",
        food: "meal",
        dining: "meal",
        sightseeing: "attraction",
        hotel: "rest",
        sleep: "rest",
        transit: "transport",
        transfer: "transport",
        shop: "shopping",
        buy: "shopping",
      };
      if (raw && map[raw]) {
        a.type = map[raw];
      }
      // If still not valid, default to "other"
      const valid = ["meal", "attraction", "transport", "rest", "shopping", "other"];
      if (!valid.includes(a.type as string)) {
        a.type = "other";
      }
    }
  }
}

/** If JSON is truncated mid-stream, try to recover up to the last valid activity. */
function findLastCompleteActivity(json: string): string | null {
  // Find positions of complete activity objects
  const activityEnds: number[] = [];
  const re = /"type"\s*:\s*"(?:meal|attraction|transport|rest|shopping|other)"\s*\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(json)) !== null) {
    activityEnds.push(m.index + m[0].length);
  }
  if (activityEnds.length === 0) return null;

  // Walk back from each complete activity until we can close the structure
  for (let i = activityEnds.length - 1; i >= 0; i--) {
    const cutPoint = activityEnds[i];
    // Try to close the arrays/objects
    const attempts = [
      json.slice(0, cutPoint) + "]}]}",
      json.slice(0, cutPoint) + "}]}]}",
    ];
    for (const attempt of attempts) {
      try {
        JSON.parse(attempt);
        return attempt;
      } catch {
        // try next
      }
    }
  }
  return null;
}

function buildPlanPrompt(config: TripConfig): string {
  const modeLabels: Record<string, string> = {
    commando: "特种兵打卡",
    relaxed: "休闲模式",
    vacation: "度假模式",
    foodie: "美食之旅",
    cultural: "文化探索",
  };

  const lines: string[] = [
    "请为以下旅行规划完整行程：",
    "",
    `目的地: ${config.destination.name}`,
    `日期范围: ${config.startDate} 至 ${config.endDate}（共 ${config.days} 天）`,
    `人数: ${config.peopleCount}人`,
    `预算: ${config.budget ? `${config.budget.toLocaleString()}元` : "不限"}`,
    `行程模式: ${modeLabels[config.mode] ?? config.mode}`,
    "",
    `请生成全部 ${config.days} 天的行程，每天包含合理的活动序列。`,
  ];

  return lines.join("\n");
}
