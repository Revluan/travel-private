"use client";

import { useState } from "react";
import { Check, Search, ArrowLeftRight, Wrench, Loader2, AlertCircle, MapPin, Sparkles, Navigation, Info } from "lucide-react";
import type { AgentEvent } from "@/lib/agent/stream-types";
import type { PlannedActivity } from "@/lib/types/trip";
import { PlaceDetailDialog } from "./place-detail-dialog";

function getToolIcon(tool: string) {
  if (tool.includes("Attraction") || tool.includes("attraction")) return Search;
  if (tool.includes("Restaurant") || tool.includes("restaurant")) return Search;
  if (tool.includes("Hotel") || tool.includes("hotel")) return Search;
  if (tool.includes("Transport") || tool.includes("transport")) return ArrowLeftRight;
  return Wrench;
}

function getActivityEmoji(type: string): string {
  switch (type) {
    case "meal": return "🍽";
    case "attraction": return "📍";
    case "transport": return "🚗";
    case "rest": return "☕";
    case "shopping": return "🛍";
    default: return "📌";
  }
}

function getTransportEmoji(mode: string): string {
  if (mode.includes("驾车") || mode.includes("driving")) return "🚗";
  if (mode.includes("步行") || mode.includes("walking")) return "🚶";
  if (mode.includes("公交") || mode.includes("地铁") || mode.includes("transit")) return "🚇";
  return "🚗";
}

interface CardContext {
  toolEvents?: AgentEvent[];
  onActivityClick?: (lng: number, lat: number, name?: string) => void;
  setDetailActivity: (v: { activity: PlannedActivity } | null) => void;
}

function renderCard(event: AgentEvent, ctx: CardContext) {
  switch (event.type) {
    case "phase": {
      return (
        <div className="flex items-center gap-2 py-1">
          <Sparkles className="h-4 w-4 text-yellow-500/70" />
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            {event.message}
          </span>
        </div>
      );
    }

    case "geocode-result": {
      return (
        <div
          className={`flex items-center gap-2 rounded-lg border py-1.5 px-2.5 ${
            event.success
              ? "border-emerald-700/30 bg-emerald-800/10"
              : "border-zinc-700/30 bg-zinc-800/10"
          }`}
        >
          {event.success ? (
            <Check className="h-3 w-3 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-3 w-3 text-zinc-500 shrink-0" />
          )}
          <Search className="h-3 w-3 text-zinc-500 shrink-0" />
          <span className="text-xs text-zinc-400 truncate">{event.title}</span>
          <span className={`text-[10px] truncate ${event.success ? "text-emerald-500" : "text-zinc-600"}`}>
            {event.success ? "已定位" : "未找到"}
          </span>
        </div>
      );
    }

    case "route-result": {
      return (
        <div
          className={`flex items-center gap-2 rounded-lg border py-1.5 px-2.5 ${
            event.success
              ? "border-cyan-700/30 bg-cyan-800/10"
              : "border-zinc-700/30 bg-zinc-800/10"
          }`}
        >
          {event.success ? (
            <Check className="h-3 w-3 text-cyan-400 shrink-0" />
          ) : (
            <AlertCircle className="h-3 w-3 text-zinc-500 shrink-0" />
          )}
          <ArrowLeftRight className="h-3 w-3 text-zinc-500 shrink-0" />
          <span className="text-xs text-zinc-400 truncate">
            {event.from} → {event.to}
          </span>
          {event.success && event.duration && (
            <span className="text-[10px] text-cyan-500 truncate">
              {event.duration} · {event.distance}
            </span>
          )}
        </div>
      );
    }

    case "day-generated": {
      const day = event.day;
      return (
        <div className="rounded-lg border border-blue-700/40 bg-blue-800/10 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Day header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/15">
              <MapPin className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-300">
                Day {day.dayNumber}
                <span className="ml-2 text-xs font-normal text-zinc-400">{day.date}</span>
              </p>
              <p className="text-xs text-zinc-500">{day.theme}</p>
            </div>
            <span className="ml-auto text-[10px] text-zinc-600">
              {event.dayNumber}/{event.totalDays}
            </span>
          </div>

          {/* Activities */}
          <div className="space-y-2">
            {day.activities.map((a, i) => (
              <div key={i}>
                <div
                  className={`rounded-md px-3 py-2 transition-colors ${
                    a.lng && a.lat
                      ? "bg-zinc-800/40 hover:bg-zinc-800/60 cursor-pointer"
                      : "bg-zinc-800/30"
                  }`}
                  onClick={() => {
                    if (a.lng != null && a.lat != null && ctx.onActivityClick) {
                      ctx.onActivityClick(a.lng, a.lat, a.title);
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xs mt-px">{getActivityEmoji(a.type)}</span>
                    <span className="text-[10px] font-mono text-zinc-500 w-9 shrink-0 mt-px">{a.time}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-zinc-200">{a.title}</span>
                        {a.lng != null && a.lat != null && (
                          <Navigation className="h-3 w-3 text-blue-400/50 shrink-0" />
                        )}
                      </div>
                      {a.location && (
                        <p className="text-[11px] text-zinc-500 mt-0.5">{a.location}</p>
                      )}
                      {a.description && (
                        <p className="text-[10px] text-zinc-600 mt-0.5 line-clamp-2">{a.description}</p>
                      )}
                      {a.highlights && (
                        <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2">{a.highlights}</p>
                      )}
                      {a.tags && a.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {a.tags.map((tag, ti) => (
                            <span
                              key={ti}
                              className="inline-block rounded-md border border-zinc-700/50 bg-zinc-800/50 px-1.5 py-0.5 text-[9px] text-zinc-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {a.recommendation && (
                        <p className="text-[10px] text-emerald-500/80 mt-0.5 italic">
                          "{a.recommendation.length > 20 ? a.recommendation.slice(0, 20) + "…" : a.recommendation}"
                        </p>
                      )}
                    </div>

                    {/* Detail button */}
                    {a.lng != null && a.lat != null && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          ctx.setDetailActivity({ activity: a });
                        }}
                        className="shrink-0 rounded-md border border-zinc-700/50 bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors"
                      >
                        <Info className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Transport between activities */}
                {a.transportTo && a.transportTo.mode && (
                  <div className="flex items-center gap-1.5 ml-9 mt-1 mb-1">
                    <div className="w-4 h-4 flex items-center justify-center rounded-full bg-zinc-800">
                      <span className="text-[10px]">{getTransportEmoji(a.transportTo.mode)}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">{a.transportTo.mode}</span>
                    <span className="text-[10px] text-zinc-600">· {a.transportTo.duration}</span>
                    <span className="text-[10px] text-zinc-600">· {a.transportTo.distance}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

export function AgentStepCard({ event, toolEvents, onActivityClick, city }: Props) {
  const [detailActivity, setDetailActivity] = useState<{
    activity: PlannedActivity;
  } | null>(null);

  return (
    <>
      {renderCard(event, { toolEvents, onActivityClick, setDetailActivity })}
      {detailActivity && (
        <PlaceDetailDialog
          activity={detailActivity.activity}
          city={city}
          open={true}
          onClose={() => setDetailActivity(null)}
        />
      )}
    </>
  );
}

interface Props {
  event: AgentEvent;
  toolEvents?: AgentEvent[];
  onActivityClick?: (lng: number, lat: number, name?: string) => void;
  city?: string;
}
