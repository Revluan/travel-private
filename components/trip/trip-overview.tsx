"use client";

import { Calendar, MapPin, Users, Wallet } from "lucide-react";
import { TRIP_MODE_LABELS } from "@/lib/types/trip";
import type { TripConfig, TripMode } from "@/lib/types/trip";

interface TripOverviewProps {
  config: TripConfig;
  overview: string;
  onChangeOverview: (value: string) => void;
}

export function TripOverview({ config, overview, onChangeOverview }: TripOverviewProps) {
  const modeLabel = TRIP_MODE_LABELS[config.mode as TripMode] ?? config.mode;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/40 p-6">
      <h3 className="mb-4 text-sm font-semibold text-zinc-300">行程总览</h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Calendar className="h-4 w-4 text-zinc-500" />
          {config.startDate} ~ {config.endDate}
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <MapPin className="h-4 w-4 text-zinc-500" />
          {config.destination.name}
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Wallet className="h-4 w-4 text-zinc-500" />
          {config.budget ? `${config.budget.toLocaleString()} 元` : "不限"}
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Users className="h-4 w-4 text-zinc-500" />
          {config.peopleCount} 人 · {modeLabel}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">行程概述</label>
        <textarea
          value={overview}
          onChange={(e) => onChangeOverview(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
        />
      </div>
    </div>
  );
}
