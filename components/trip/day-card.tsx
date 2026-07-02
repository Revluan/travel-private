"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { ActivityRow } from "./activity-row";
import type { PlannedActivity, ActivityType } from "@/lib/types/trip";

interface DayData {
  id?: string;
  dayNumber: number;
  date: string;
  theme: string;
  activities: PlannedActivity[];
}

interface DayCardProps {
  day: DayData;
  onChange: (updated: DayData) => void;
}

const defaultActivity = (): PlannedActivity => ({
  time: "09:00",
  title: "",
  description: "",
  location: "",
  type: "attraction" as ActivityType,
});

export function DayCard({ day, onChange }: DayCardProps) {
  const [expanded, setExpanded] = useState(true);

  const updateTheme = (theme: string) => onChange({ ...day, theme });
  const updateActivity = (index: number, activity: PlannedActivity) => {
    const activities = [...day.activities];
    activities[index] = activity;
    onChange({ ...day, activities });
  };
  const deleteActivity = (index: number) => {
    const activities = day.activities.filter((_, i) => i !== index);
    onChange({ ...day, activities });
  };
  const addActivity = () => {
    onChange({ ...day, activities: [...day.activities, defaultActivity()] });
  };

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-5 py-4 hover:bg-zinc-800/60 transition-colors"
      >
        <ChevronDown
          className={`h-4 w-4 text-zinc-500 transition-transform ${
            expanded ? "" : "-rotate-90"
          }`}
        />
        <span className="text-sm font-semibold text-zinc-300">
          Day {day.dayNumber} · {day.date}
        </span>
        <span className="text-xs text-zinc-500">
          {day.activities.length} 个活动
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3">
          <input
            type="text"
            value={day.theme}
            onChange={(e) => updateTheme(e.target.value)}
            placeholder="当日主题"
            className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />

          <div className="space-y-2">
            {day.activities.map((activity, index) => (
              <ActivityRow
                key={index}
                activity={activity}
                onChange={(updated) => updateActivity(index, updated)}
                onDelete={() => deleteActivity(index)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addActivity}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-600 py-2.5 text-xs text-zinc-500 hover:border-zinc-500 hover:text-zinc-400 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            添加活动
          </button>
        </div>
      )}
    </div>
  );
}
