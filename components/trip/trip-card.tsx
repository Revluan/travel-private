"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Pencil, Trash2, Eye } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MAILLARD_GRADIENTS,
  MAILLARD_BADGE_COLORS,
  MAILLARD_STATUS_COLORS,
  TRIP_STATUS_LABELS,
  CARD_STYLES,
} from "@/lib/constants/maillard";
import {
  TRIP_MODE_LABELS,
  TRIP_MODES,
  type TripMode,
  type TripStatus,
} from "@/lib/types/trip";

interface TripCardProps {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  destinationName: string;
  peopleCount: number;
  mode: string;
  overview: string;
  status: TripStatus;
  onDelete: (id: string) => void;
}

export function TripCard({
  id,
  title,
  startDate,
  endDate,
  destinationName,
  peopleCount,
  mode,
  overview,
  status,
  onDelete,
}: TripCardProps) {
  const modeLabel = TRIP_MODE_LABELS[mode as TripMode] ?? mode;
  const gradient =
    MAILLARD_GRADIENTS[mode as TripMode] ??
    "linear-gradient(135deg, #6B3A2A 0%, #8B5E3C 100%)";
  const badgeColor =
    MAILLARD_BADGE_COLORS[mode as TripMode] ??
    "bg-stone-800/70 text-stone-200 border-stone-600/40";
  const statusColor =
    MAILLARD_STATUS_COLORS[status] ??
    "bg-zinc-800/50 text-zinc-300 border-zinc-700/40";
  const statusLabel = TRIP_STATUS_LABELS[status] ?? status;

  const days = calculateDays(startDate, endDate);
  const [confirming, setConfirming] = useState(false);

  return (
    <Card
      className={cn(
        "group/card border border-zinc-700/50 bg-zinc-800/60 text-white overflow-hidden",
        CARD_STYLES.rounded,
        CARD_STYLES.transition,
        CARD_STYLES.hover.transform,
        CARD_STYLES.hover.shadow,
        CARD_STYLES.hover.border
      )}
    >
      <div
        className="h-24 relative flex items-end px-5 pb-3"
        style={{ background: gradient }}
      >
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("border-white/20 text-white/90", badgeColor)}
          >
            {modeLabel}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-0">
        <div className="text-lg font-semibold text-white">{title}</div>
      </CardHeader>

      <CardContent className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-zinc-500" />
            {startDate} ~ {endDate}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-zinc-500" />
            {destinationName}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-zinc-500" />
            {peopleCount} 人
          </span>
        </div>

        {overview && (
          <p className="text-sm text-zinc-500 line-clamp-2">{overview}</p>
        )}

        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <Badge variant="outline" className="border-zinc-600/50 text-zinc-400">
            {days} 天
          </Badge>
          <Badge variant="outline" className="border-zinc-600/50 text-zinc-400">
            {peopleCount} 人
          </Badge>
          <Badge variant="outline" className={cn("border", statusColor)}>
            {statusLabel}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="border-t border-zinc-700/30 bg-transparent">
        <div className="flex items-center gap-1 ml-auto">
          <Link href={`/trips/${id}`}>
            <Button variant="ghost" size="icon-xs" className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link href={`/trips/${id}`}>
            <Button variant="ghost" size="icon-xs" className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
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
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setConfirming(true)}
              className="text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
}
