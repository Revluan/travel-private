"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TripForm } from "@/components/trip/trip-form";
import { TripMap } from "@/components/trip/trip-map";
import type { TripConfig, TripDestination } from "@/lib/types/trip";

export default function NewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState<TripDestination | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (config: TripConfig) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/trips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "生成失败");
      }

      const data = await res.json();
      router.push(`/trips/${data.trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI 规划失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen pt-16">
      <div className="w-[420px] shrink-0 overflow-y-auto border-r border-zinc-800 p-6">
        <h1 className="mb-6 text-xl font-bold text-white">新建行程</h1>
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
        <TripForm
          onSubmit={handleSubmit}
          loading={loading}
          onDestinationChange={setDestination}
        />
      </div>

      <div className="flex-1 p-4">
        <TripMap lat={destination?.lat} lng={destination?.lng} />
      </div>
    </div>
  );
}
