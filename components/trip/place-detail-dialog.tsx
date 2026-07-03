"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Phone, Clock, MapPin, Globe, AlertCircle, Loader2 } from "lucide-react";
import type { PlannedActivity } from "@/lib/types/trip";
import type { PlaceDetailResponse } from "@/app/api/amap/place-detail/route";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  activity: PlannedActivity;
  city?: string;
  open: boolean;
  onClose: () => void;
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-2 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 w-48 shrink-0 rounded-lg bg-zinc-800" />
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-5 w-2/3 rounded bg-zinc-800" />
        <div className="h-4 w-1/2 rounded bg-zinc-800" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-zinc-800" />
        <div className="h-5 w-20 rounded-full bg-zinc-800" />
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-4 w-full rounded bg-zinc-800" />
        <div className="h-4 w-3/4 rounded bg-zinc-800" />
      </div>
    </div>
  );
}

export function PlaceDetailDialog({ activity, city, open, onClose }: Props) {
  const [data, setData] = useState<PlaceDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDetail = useCallback(async () => {
    if (!activity.title) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ keyword: activity.title });
      if (city) params.set("city", city);
      const res = await fetch(`/api/amap/place-detail?${params}`);
      const json = await res.json();
      setData(json);
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [activity.title, city]);

  useEffect(() => {
    if (open) {
      setData(null);
      setError("");
      fetchDetail();
    }
  }, [open, fetchDetail]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto p-0">
        {/* Loading */}
        {loading && (
          <div className="p-5">
            <Skeleton />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-6 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-8 w-8 text-zinc-500" />
            <div>
              <DialogTitle className="mb-1">加载失败</DialogTitle>
              <DialogDescription>{error}</DialogDescription>
            </div>
            <button
              onClick={fetchDetail}
              className="mt-1 rounded-lg border border-zinc-700 px-4 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              重试
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && data?.notFound && (
          <div className="p-6 flex flex-col items-center gap-3 text-center">
            <MapPin className="h-8 w-8 text-zinc-600" />
            <div>
              <DialogTitle className="mb-1">{activity.title}</DialogTitle>
              <DialogDescription>暂无详情数据</DialogDescription>
            </div>
            {activity.location && (
              <p className="text-xs text-zinc-500 mt-1">{activity.location}</p>
            )}
          </div>
        )}

        {/* Content */}
        {!loading && !error && data && !data.notFound && !data.error && (
          <>
            {/* Photos */}
            {data.photos && data.photos.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto px-1 pt-1 -mx-1 pb-2">
                {data.photos.slice(0, 5).map((photo, i) => (
                  <img
                    key={i}
                    src={photo.url}
                    alt={photo.title || data.name || ""}
                    className="h-44 w-56 shrink-0 rounded-lg object-cover bg-zinc-800"
                    loading="lazy"
                  />
                ))}
              </div>
            )}

            <div className="p-5 space-y-4">
              {/* Name + address */}
              <div>
                <DialogTitle className="text-base">{data.name}</DialogTitle>
                {data.address && (
                  <p className="text-xs text-zinc-500 mt-0.5">{data.address}</p>
                )}
              </div>

              {/* Rating + cost chips */}
              {(data.rating || data.cost || data.level) && (
                <div className="flex gap-2 flex-wrap">
                  {data.rating && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400">
                      <Star className="h-3 w-3 fill-amber-400" />
                      {data.rating}
                    </span>
                  )}
                  {data.level && (
                    <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-400">
                      {data.level}
                    </span>
                  )}
                  {data.cost && (
                    <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                      人均 ¥{data.cost}
                    </span>
                  )}
                </div>
              )}

              {/* Tags */}
              {data.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {data.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-block rounded-md border border-zinc-700/50 bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Detail rows */}
              <div className="space-y-2.5 pt-1 border-t border-zinc-800">
                {data.tel && (
                  <div className="flex items-start gap-2.5">
                    <Phone className="h-3.5 w-3.5 text-zinc-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-zinc-300">{data.tel}</span>
                  </div>
                )}
                {data.openTime && (
                  <div className="flex items-start gap-2.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-zinc-300">{data.openTime}</span>
                  </div>
                )}
                {data.address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-zinc-300">{data.address}</span>
                  </div>
                )}
                {data.website && (
                  <div className="flex items-start gap-2.5">
                    <Globe className="h-3.5 w-3.5 text-zinc-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-zinc-300">{data.website}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
