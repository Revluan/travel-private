"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";
import type { AgentEvent, DayGeneratedEvent } from "@/lib/agent/stream-types";
import type { GeneratedDay, GeneratedItinerary } from "@/lib/types/trip";
import { AgentStepCard } from "./agent-step-card";

interface Props {
  config: {
    startDate: string;
    endDate: string;
    destination: { name: string };
    days: number;
    peopleCount: number;
    mode: string;
    budget?: number;
  };
  onComplete: (itinerary: GeneratedItinerary) => void;
  onCancel: () => void;
  onActivityClick?: (lng: number, lat: number, name?: string) => void;
}

interface DayGroup {
  tools: AgentEvent[];
  day: GeneratedDay | null;
  dayNumber: number;
  totalDays: number;
}

export function AgentProgress({ config, onComplete, onCancel, onActivityClick }: Props) {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [currentPhase, setCurrentPhase] = useState<"init" | "planning" | "geocoding" | "routing" | "complete" | "error">("init");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startStream = useCallback(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    fetch("/api/trips/generate/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "请求失败");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("无法读取响应流");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event: AgentEvent = JSON.parse(line.slice(6));
                setEvents((prev) => [...prev, event]);

                if (event.type === "phase") {
                  setCurrentPhase(event.phase);
                } else if (event.type === "complete") {
                  setCurrentPhase("complete");
                  onComplete(event.itinerary);
                } else if (event.type === "error") {
                  setCurrentPhase("error");
                  setError(event.message);
                }
              } catch {
                // skip unparseable lines
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setCurrentPhase("error");
          setError(err instanceof Error ? err.message : "连接失败");
        }
      });
  }, [config, onComplete]);

  useEffect(() => {
    startStream();
    return () => {
      abortRef.current?.abort();
    };
  }, [startStream]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events]);

  const handleCancel = () => {
    abortRef.current?.abort();
    onCancel();
  };

  // ── Compute display structure ──────────────────────────
  const { phaseEvents, geocodeEvents, routeEvents, dayGroups, daysCount } = useMemo(() => {
    const phaseEvents: AgentEvent[] = [];
    const geocodeEvents: AgentEvent[] = [];
    const routeEvents: AgentEvent[] = [];
    const dayMap = new Map<number, DayGroup>();

    for (const event of events) {
      if (event.type === "phase") {
        phaseEvents.push(event);
      } else if (event.type === "geocode-result") {
        geocodeEvents.push(event);
      } else if (event.type === "route-result") {
        routeEvents.push(event);
      } else if (event.type === "day-generated") {
        let group = dayMap.get(event.dayNumber);
        if (!group) {
          group = { tools: [], day: null, dayNumber: event.dayNumber, totalDays: event.totalDays };
          dayMap.set(event.dayNumber, group);
        }
        group.day = event.day;
        group.totalDays = event.totalDays;
      }
    }

    return {
      phaseEvents,
      geocodeEvents,
      routeEvents,
      dayGroups: [...dayMap.values()].sort((a, b) => a.dayNumber - b.dayNumber),
      daysCount: [...dayMap.values()].filter((g) => g.day != null).length,
    };
  }, [events, config.days]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          {currentPhase === "init" && (
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          )}
          {currentPhase === "planning" && (
            <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
          )}
          {currentPhase === "geocoding" && (
            <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
          )}
          {currentPhase === "routing" && (
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          )}
          {currentPhase === "complete" && (
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
          )}
          {currentPhase === "error" && (
            <div className="h-2 w-2 rounded-full bg-red-400" />
          )}
          <span className="text-sm font-medium text-zinc-300">
            {currentPhase === "init" && "正在分析行程配置..."}
            {currentPhase === "planning" && `正在生成行程...`}
            {currentPhase === "geocoding" && "正在查找地点坐标..."}
            {currentPhase === "routing" && "正在计算交通路线..."}
            {currentPhase === "complete" && "行程生成完成"}
            {currentPhase === "error" && "规划失败"}
          </span>
        </div>
        {(currentPhase === "init" || currentPhase === "planning" || currentPhase === "geocoding" || currentPhase === "routing") && (
          <button
            onClick={handleCancel}
            className="rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 transition-colors"
          >
            取消
          </button>
        )}
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="flex-1 space-y-2 overflow-y-auto pr-1"
      >
        {/* Phase transitions */}
        {phaseEvents.map((event, i) => (
          <AgentStepCard key={`phase-${i}`} event={event} />
        ))}

        {/* Day cards */}
        {dayGroups.map((group) => (
          <div key={`day-group-${group.dayNumber}`}>
            {group.day ? (
              <AgentStepCard
                event={{
                  type: "day-generated",
                  day: group.day,
                  dayNumber: group.dayNumber,
                  totalDays: group.totalDays,
                } satisfies DayGeneratedEvent}
                onActivityClick={onActivityClick}
                city={config.destination.name}
              />
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-800/40 p-3 ml-2">
                <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
                <span className="text-xs text-zinc-500">正在规划第 {group.dayNumber} 天行程...</span>
              </div>
            )}
          </div>
        ))}

        {/* Geocoding results */}
        {geocodeEvents.length > 0 && (
          <div className="space-y-1 ml-2">
            {geocodeEvents.map((event, i) => (
              <AgentStepCard key={`geocode-${i}`} event={event} />
            ))}
          </div>
        )}

        {/* Route results */}
        {routeEvents.length > 0 && (
          <div className="space-y-1 ml-2">
            {routeEvents.map((event, i) => (
              <AgentStepCard key={`route-${i}`} event={event} />
            ))}
          </div>
        )}

        {/* Initial loading */}
        {currentPhase === "init" && events.length === 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-zinc-700/50 bg-zinc-800/40 p-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            <span className="text-sm text-zinc-400">正在分析行程配置...</span>
          </div>
        )}

        {currentPhase === "error" && (
          <div className="rounded-lg border border-red-700/50 bg-red-800/20 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
