"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { TripConfig, TripDestination, GeneratedItinerary } from "@/lib/types/trip";
import type { RoutePoint, HighlightPoint } from "@/components/trip/trip-map";
import type { DayGeneratedEvent } from "@/lib/agent/stream-types";
import { AgentProgress } from "@/components/trip/agent-progress";
import { AgentStepCard } from "@/components/trip/agent-step-card";

const TripForm = dynamic(
  () => import("@/components/trip/trip-form").then((mod) => mod.TripForm),
  { ssr: false },
);

const TripMap = dynamic(
  () => import("@/components/trip/trip-map").then((mod) => mod.TripMap),
  { ssr: false, loading: () => <div className="h-full min-h-[400px] rounded-xl border border-zinc-700 bg-zinc-800/30" /> },
);

type PageState =
  | { phase: "form" }
  | { phase: "generating"; config: TripConfig }
  | { phase: "preview"; config: TripConfig; itinerary: GeneratedItinerary }
  | { phase: "error"; config: TripConfig; message: string };

export default function NewTripPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>({ phase: "form" });
  const [destination, setDestination] = useState<TripDestination | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Route display: accumulate clicked activities for map polylines
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [highlightPoint, setHighlightPoint] = useState<HighlightPoint | undefined>(undefined);

  const handleSubmit = (config: TripConfig) => {
    setRoutePoints([]);
    setSelectedDayNumber(null);
    setHighlightPoint(undefined);
    setState({ phase: "generating", config });
  };

  const handleComplete = (itinerary: GeneratedItinerary) => {
    setState((prev) =>
      prev.phase === "generating"
        ? { phase: "preview", config: prev.config, itinerary }
        : prev,
    );
  };

  const handleCancel = () => {
    setState({ phase: "form" });
    setRoutePoints([]);
    setSelectedDayNumber(null);
    setHighlightPoint(undefined);
  };

  const handleActivityClick = useCallback((lng: number, lat: number) => {
    setRoutePoints((prev) => {
      // Toggle: remove if already at the end, otherwise add
      const last = prev[prev.length - 1];
      if (last && last.lng === lng && last.lat === lat) {
        return prev.slice(0, -1);
      }
      if (prev.length >= 10) return prev; // max 10 points
      return [...prev, { lng, lat }];
    });
  }, []);

  const handleSave = async () => {
    if (state.phase !== "preview") return;
    setSaving(true);
    setSaveError("");

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: state.config,
          itinerary: state.itinerary,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "保存失败");
      }

      const data = await res.json();
      router.push(`/trips/${data.trip.id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = () => {
    setRoutePoints([]);
    setSelectedDayNumber(null);
    setHighlightPoint(undefined);
    if (state.phase === "preview" || state.phase === "error") {
      setState({ phase: "generating", config: state.config });
    }
  };

  const isFormVisible = state.phase === "form";

  return (
    <div className="flex h-screen pt-16">
      {/* Left panel */}
      <div
        ref={containerRef}
        className="w-[560px] shrink-0 overflow-y-auto border-r border-zinc-800 p-6"
      >
        {isFormVisible && (
          <>
            <h1 className="mb-6 text-xl font-bold text-white">新建行程</h1>
            <TripForm
              onSubmit={handleSubmit}
              loading={false}
              onDestinationChange={setDestination}
            />
          </>
        )}

        {state.phase === "generating" && (
          <>
            <h1 className="mb-4 text-xl font-bold text-white">AI Agent 规划中</h1>
            <AgentProgress
              config={state.config}
              onComplete={handleComplete}
              onCancel={handleCancel}
              onActivityClick={handleActivityClick}
            />
            {routePoints.length > 0 && (
              <p className="mt-3 text-[11px] text-zinc-500">
                已选择 {routePoints.length} 个地点显示在地图上，点击地点可取消选择
              </p>
            )}
          </>
        )}

        {state.phase === "preview" && (
          <>
            <h1 className="mb-4 text-xl font-bold text-white">行程预览</h1>
            <div className="space-y-4">
              <div className="rounded-lg border border-emerald-700/50 bg-emerald-800/20 p-4">
                <h2 className="text-sm font-semibold text-emerald-300">
                  {state.config.destination.name} · {state.config.days}天
                </h2>
                <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                  {state.itinerary.overview}
                </p>
              </div>

              {/* Day tabs for route selection */}
              <div className="flex gap-1.5 flex-wrap">
                {state.itinerary.days.map((day) => (
                  <button
                    key={day.dayNumber}
                    onClick={() => {
                      const isActive = selectedDayNumber === day.dayNumber;
                      setSelectedDayNumber(isActive ? null : day.dayNumber);
                      setHighlightPoint(undefined);
                      if (isActive) {
                        setRoutePoints([]);
                      } else {
                        const points: RoutePoint[] = day.activities
                          .filter((a) => a.lng != null && a.lat != null)
                          .map((a) => ({ lng: a.lng!, lat: a.lat!, name: a.title }));
                        setRoutePoints(points);
                      }
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                      selectedDayNumber === day.dayNumber
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    Day {day.dayNumber}
                  </button>
                ))}
              </div>

              {/* Day cards using AgentStepCard */}
              <div className="space-y-2">
                {state.itinerary.days.map((day) => {
                  const dayEvent: DayGeneratedEvent = {
                    type: "day-generated",
                    day,
                    dayNumber: day.dayNumber,
                    totalDays: state.itinerary.days.length,
                  };
                  return (
                    <AgentStepCard
                      key={day.dayNumber}
                      event={dayEvent}
                      onActivityClick={(lng, lat, name) => {
                        setHighlightPoint(
                          highlightPoint?.lng === lng && highlightPoint?.lat === lat
                            ? undefined
                            : { lng, lat, name },
                        );
                        // Only clear route points if this is a fresh click
                        if (!(highlightPoint?.lng === lng && highlightPoint?.lat === lat)) {
                          setRoutePoints([]);
                          setSelectedDayNumber(null);
                        }
                      }}
                      city={state.config.destination.name}
                    />
                  );
                })}
              </div>

              {saveError && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                  {saveError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50"
                >
                  {saving ? "保存中..." : "保存行程"}
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={saving}
                  className="rounded-xl border border-zinc-700 px-4 py-3 text-sm text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 transition-colors disabled:opacity-50"
                >
                  重新生成
                </button>
              </div>
            </div>
          </>
        )}

        {state.phase === "error" && (
          <>
            <h1 className="mb-4 text-xl font-bold text-white">规划失败</h1>
            <div className="rounded-lg border border-red-700/50 bg-red-800/20 p-4">
              <p className="text-sm text-red-400">{state.message}</p>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleRegenerate}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white"
              >
                重试
              </button>
              <button
                onClick={handleCancel}
                className="rounded-xl border border-zinc-700 px-4 py-3 text-sm text-zinc-400"
              >
                返回
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right panel: map */}
      <div className="flex-1 p-4">
        <TripMap
          lat={destination?.lat}
          lng={destination?.lng}
          routePoints={routePoints.length > 0 ? routePoints : undefined}
          highlightPoint={highlightPoint}
        />
      </div>
    </div>
  );
}
