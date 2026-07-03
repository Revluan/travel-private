"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { AgentStepCard } from "@/components/trip/agent-step-card";
import type { TripConfig, PlannedActivity } from "@/lib/types/trip";
import type { RoutePoint, HighlightPoint } from "@/components/trip/trip-map";
import type { DayGeneratedEvent } from "@/lib/agent/stream-types";

const TripMap = dynamic(
  () => import("@/components/trip/trip-map").then((mod) => mod.TripMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[400px] rounded-xl border border-zinc-700 bg-zinc-800/30" />
    ),
  },
);

interface DayData {
  dayNumber: number;
  date: string;
  theme: string;
  activities: PlannedActivity[];
}

export default function TripDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [config, setConfig] = useState<TripConfig | null>(null);
  const [overview, setOverview] = useState("");
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [highlightPoint, setHighlightPoint] = useState<HighlightPoint | undefined>(undefined);

  useEffect(() => {
    fetch(`/api/trips/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setConfig(data.config as TripConfig);
        setOverview(data.overview ?? "");
        setDays(
          (data.days ?? []).map(
            (d: { dayNumber: number; date: string; theme: string; activities: PlannedActivity[] }) => ({
              dayNumber: d.dayNumber,
              date: d.date,
              theme: d.theme,
              activities: d.activities ?? [],
            }),
          ),
        );
      })
      .catch(() => setError("行程未找到"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDayTabClick = useCallback(
    (dayNumber: number) => {
      if (selectedDayNumber === dayNumber) {
        setSelectedDayNumber(null);
        setHighlightPoint(undefined);
        setRoutePoints([]);
      } else {
        setSelectedDayNumber(dayNumber);
        setHighlightPoint(undefined);
        const day = days.find((d) => d.dayNumber === dayNumber);
        if (day) {
          const points: RoutePoint[] = day.activities
            .filter((a) => a.lng != null && a.lat != null)
            .map((a) => ({ lng: a.lng!, lat: a.lat!, name: a.title }));
          setRoutePoints(points);
        }
      }
    },
    [days, selectedDayNumber],
  );

  const handleActivityClick = useCallback((lng: number, lat: number, name?: string) => {
    setHighlightPoint((prev) =>
      prev?.lng === lng && prev?.lat === lat
        ? undefined
        : { lng, lat, name },
    );
    setRoutePoints([]);
    setSelectedDayNumber(null);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center pt-16">
        <p className="text-zinc-500">加载中...</p>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="flex h-screen items-center justify-center pt-16">
        <div className="text-center space-y-4">
          <p className="text-zinc-400">{error}</p>
          <Link href="/trips" className="text-sm text-blue-400 hover:text-blue-300">
            返回行程列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen pt-16">
      {/* Left panel: itinerary */}
      <div className="w-[560px] shrink-0 overflow-y-auto border-r border-zinc-800 p-6">
        <Link
          href="/trips"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          我的行程
        </Link>

        {config && (
          <div className="space-y-4">
            {/* Overview card */}
            <div className="rounded-lg border border-emerald-700/50 bg-emerald-800/20 p-4">
              <h2 className="text-sm font-semibold text-emerald-300">
                {config.destination.name} · {config.days}天
              </h2>
              <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{overview}</p>
            </div>

            {/* Day tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {days.map((day) => (
                <button
                  key={day.dayNumber}
                  onClick={() => handleDayTabClick(day.dayNumber)}
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

            {/* Day cards */}
            <div className="space-y-2">
              {days.map((day) => {
                const dayEvent: DayGeneratedEvent = {
                  type: "day-generated",
                  day: {
                    dayNumber: day.dayNumber,
                    date: day.date,
                    theme: day.theme,
                    activities: day.activities,
                  },
                  dayNumber: day.dayNumber,
                  totalDays: days.length,
                };
                return (
                  <AgentStepCard
                    key={day.dayNumber}
                    event={dayEvent}
                    onActivityClick={handleActivityClick}
                    city={config?.destination.name}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right panel: map */}
      <div className="flex-1 p-4">
        <TripMap
          lat={config?.destination.lat}
          lng={config?.destination.lng}
          routePoints={routePoints.length > 0 ? routePoints : undefined}
          highlightPoint={highlightPoint}
        />
      </div>
    </div>
  );
}
