"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { TripOverview } from "@/components/trip/trip-overview";
import { DayCard } from "@/components/trip/day-card";
import type { TripConfig, PlannedActivity, ActivityType } from "@/lib/types/trip";

interface DayData {
  id?: string;
  dayNumber: number;
  date: string;
  theme: string;
  activities: PlannedActivity[];
}

const defaultActivity = (): PlannedActivity => ({
  time: "09:00",
  title: "",
  description: "",
  location: "",
  type: "attraction" as ActivityType,
});

export default function TripDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [config, setConfig] = useState<TripConfig | null>(null);
  const [overview, setOverview] = useState("");
  const [days, setDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
            (d: { id: string; dayNumber: number; date: string; theme: string; activities: PlannedActivity[] }) => ({
              id: d.id,
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

  const updateDay = useCallback((index: number, updated: DayData) => {
    setDays((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  }, []);

  const addDay = () => {
    const maxNumber = days.reduce((max, d) => Math.max(max, d.dayNumber), 0);
    setDays((prev) => [
      ...prev,
      {
        dayNumber: maxNumber + 1,
        date: "",
        theme: "",
        activities: [defaultActivity()],
      },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/trips/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overview, days }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "保存失败");
      }

      router.push("/trips");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

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
    <div className="min-h-screen pt-16 pb-20">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/trips"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            我的行程
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "保存中..." : "保存行程"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {config && (
          <div className="mb-6">
            <TripOverview
              config={config}
              overview={overview}
              onChangeOverview={setOverview}
            />
          </div>
        )}

        <div className="space-y-4">
          {days.map((day, index) => (
            <DayCard
              key={index}
              day={day}
              onChange={(updated) => updateDay(index, updated)}
            />
          ))}
        </div>

        <button
          onClick={addDay}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-600 py-4 text-sm text-zinc-500 hover:border-zinc-500 hover:text-zinc-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          新增一天
        </button>
      </div>
    </div>
  );
}
