"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TripCard } from "@/components/trip/trip-card";
import type { TripConfig, TripStatus } from "@/lib/types/trip";

interface TripItem {
  id: string;
  title: string;
  config: TripConfig;
  overview: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = useCallback(() => {
    fetch("/api/trips")
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then(setTrips)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/trips/${id}`, { method: "DELETE" });
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen pt-16 pb-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">我的行程</h1>
          <Link
            href="/trips/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-amber-500 hover:to-orange-400"
          >
            <Plus className="h-4 w-4" />
            新建
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-700/50 bg-zinc-800/60 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-zinc-500 mb-4">还没有行程</p>
            <Link
              href="/trips/new"
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              创建第一个行程 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                id={trip.id}
                title={trip.title}
                startDate={trip.config.startDate}
                endDate={trip.config.endDate}
                destinationName={trip.config.destination.name}
                peopleCount={trip.config.peopleCount}
                mode={trip.config.mode}
                overview={trip.overview}
                status={trip.status as TripStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
