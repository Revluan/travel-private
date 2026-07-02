"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TripListItem } from "@/components/trip/trip-list-item";
import type { TripConfig } from "@/lib/types/trip";

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
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">我的行程</h1>
          <Link
            href="/trips/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-blue-500 hover:to-cyan-400"
          >
            <Plus className="h-4 w-4" />
            新建
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-sm text-zinc-500 py-12">加载中...</p>
        ) : trips.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-zinc-500 mb-4">还没有行程</p>
            <Link
              href="/trips/new"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              创建第一个行程 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <TripListItem
                key={trip.id}
                id={trip.id}
                title={trip.title}
                startDate={trip.config.startDate}
                endDate={trip.config.endDate}
                destinationName={trip.config.destination.name}
                peopleCount={trip.config.peopleCount}
                mode={trip.config.mode}
                overview={trip.overview}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
