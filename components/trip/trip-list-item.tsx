"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Pencil, Trash2, Eye } from "lucide-react";
import { TRIP_MODE_LABELS } from "@/lib/types/trip";
import type { TripMode } from "@/lib/types/trip";

interface TripListItemProps {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  destinationName: string;
  peopleCount: number;
  mode: string;
  overview: string;
  onDelete: (id: string) => void;
}

export function TripListItem({
  id,
  title,
  startDate,
  endDate,
  destinationName,
  peopleCount,
  mode,
  overview,
  onDelete,
}: TripListItemProps) {
  const modeLabel =
    TRIP_MODE_LABELS[mode as TripMode] ?? mode;

  const [confirming, setConfirming] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/40 p-5 transition-colors hover:border-zinc-600">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
              {startDate} ~ {endDate}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-zinc-500" />
              {destinationName}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-zinc-500" />
              {peopleCount} 人
            </span>
            <span className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-300">
              {modeLabel}
            </span>
          </div>
          {overview && (
            <p className="text-sm text-zinc-500 line-clamp-2 pt-1">{overview}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Link
            href={`/trips/${id}`}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-700/50 hover:text-zinc-300 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/trips/${id}`}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-700/50 hover:text-zinc-300 transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          {confirming ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  onDelete(id);
                  setConfirming(false);
                }}
                className="rounded-lg px-2 py-1 text-xs text-red-400 hover:bg-red-400/10"
              >
                确认
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-lg px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-700/50"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg p-2 text-zinc-500 hover:bg-red-400/10 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
