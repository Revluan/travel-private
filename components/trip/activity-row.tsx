"use client";

import { Trash2 } from "lucide-react";
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LABELS } from "@/lib/types/trip";
import type { PlannedActivity, ActivityType } from "@/lib/types/trip";

interface ActivityRowProps {
  activity: PlannedActivity;
  onChange: (updated: PlannedActivity) => void;
  onDelete: () => void;
}

export function ActivityRow({ activity, onChange, onDelete }: ActivityRowProps) {
  const update = (field: keyof PlannedActivity, value: string) => {
    onChange({ ...activity, [field]: value });
  };

  return (
    <div className="group rounded-lg border border-zinc-700/60 bg-zinc-800/30 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={activity.time}
          onChange={(e) => update("time", e.target.value)}
          className="w-28 rounded-md border border-zinc-700 bg-zinc-800/50 px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />

        <select
          value={activity.type}
          onChange={(e) => update("type", e.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-800/50 px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        >
          {ACTIVITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {ACTIVITY_TYPE_LABELS[t]}
            </option>
          ))}
        </select>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onDelete}
          className="rounded-md p-1.5 text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <input
        type="text"
        value={activity.title}
        onChange={(e) => update("title", e.target.value)}
        placeholder="活动名称"
        className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-2 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
      />

      <div className="grid grid-cols-1 gap-2">
        <input
          type="text"
          value={activity.location}
          onChange={(e) => update("location", e.target.value)}
          placeholder="地点"
          className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-2 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
        <textarea
          value={activity.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="活动描述"
          rows={2}
          className="w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-2 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
        />
      </div>
    </div>
  );
}
