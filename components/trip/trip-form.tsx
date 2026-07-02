"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, MapPin, Users, Wallet, Target } from "lucide-react";
import { TRIP_MODES, TRIP_MODE_LABELS } from "@/lib/types/trip";
import type { TripConfig, TripMode, TripDestination } from "@/lib/types/trip";

const AMAP_WEB_KEY = process.env.NEXT_PUBLIC_AMAP_WEB_KEY ?? "";

interface TripFormProps {
  onSubmit: (config: TripConfig) => void;
  loading?: boolean;
  onDestinationChange?: (destination: TripDestination | null) => void;
}

interface Suggestion {
  name: string;
  district: string;
  lat: number;
  lng: number;
}

export function TripForm({ onSubmit, loading, onDestinationChange }: TripFormProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [destination, setDestination] = useState<TripDestination | null>(null);
  const [destInput, setDestInput] = useState("");
  const [budget, setBudget] = useState("");
  const [peopleCount, setPeopleCount] = useState("1");
  const [mode, setMode] = useState<TripMode>("relaxed");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleDestInput = (value: string) => {
    setDestInput(value);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://restapi.amap.com/v3/config/district?key=${AMAP_WEB_KEY}&keywords=${encodeURIComponent(value)}&subdistrict=0`,
        );
        const data = await res.json();
        if (data.status !== "1" || !data.districts) return;

        const tips: Suggestion[] = [];
        for (const d of data.districts) {
          if (d.center && d.name && d.level === "city") {
            const [lng, lat] = d.center.split(",").map(Number);
            if (!isNaN(lng) && !isNaN(lat)) {
              tips.push({ name: d.name, district: "", lng, lat });
            }
          }
        }
        setSuggestions(tips);
        setShowSuggestions(tips.length > 0);
      } catch {
        // network error, silently ignore
      }
    }, 300);
  };

  const handleSelect = (suggestion: Suggestion) => {
    const dest: TripDestination = {
      placeId: `${suggestion.lng},${suggestion.lat}`,
      name: suggestion.name,
      formattedAddress: suggestion.district || suggestion.name,
      lat: suggestion.lat,
      lng: suggestion.lng,
    };
    setDestination(dest);
    setDestInput(suggestion.name);
    setShowSuggestions(false);
    onDestinationChange?.(dest);
  };

  const days =
    startDate && endDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000,
          ),
        )
      : 0;

  const validate = useCallback((): boolean => {
    const next: Record<string, string> = {};
    if (!startDate) next.startDate = "请选择开始日期";
    if (!endDate) next.endDate = "请选择结束日期";
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      next.endDate = "结束日期必须晚于开始日期";
    }
    if (!destination) next.destination = "请选择目的地";
    if (!peopleCount || Number(peopleCount) < 1) next.peopleCount = "人数至少为 1";
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [startDate, endDate, destination, peopleCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !destination) return;

    onSubmit({
      startDate,
      endDate,
      destination,
      budget: budget ? Number(budget) : undefined,
      days,
      peopleCount: Number(peopleCount),
      mode,
    });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Calendar className="h-4 w-4" />
          日期范围
        </label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => setStartDate(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <span className="text-zinc-500">—</span>
          <input
            type="date"
            value={endDate}
            min={startDate || today}
            onChange={(e) => setEndDate(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        {errors.startDate && <p className="text-xs text-red-400">{errors.startDate}</p>}
        {errors.endDate && <p className="text-xs text-red-400">{errors.endDate}</p>}
        {days > 0 && <p className="text-xs text-zinc-500">共 {days} 天</p>}
      </div>

      <div className="space-y-2" ref={containerRef}>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <MapPin className="h-4 w-4" />
          目的地
        </label>
        <div className="relative">
          <input
            type="text"
            value={destInput}
            onChange={(e) => handleDestInput(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder="输入城市名称..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-zinc-700 bg-zinc-800 shadow-lg">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700/50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <span className="font-medium">{s.name}</span>
                  {s.district && (
                    <span className="ml-2 text-xs text-zinc-500">{s.district}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.destination && <p className="text-xs text-red-400">{errors.destination}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Wallet className="h-4 w-4" />
            预算（可选）
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="不限"
            min="0"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
            <Users className="h-4 w-4" />
            人数
          </label>
          <input
            type="number"
            value={peopleCount}
            onChange={(e) => setPeopleCount(e.target.value)}
            min="1"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          {errors.peopleCount && <p className="text-xs text-red-400">{errors.peopleCount}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <Target className="h-4 w-4" />
          行程模式
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TRIP_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-lg border px-3 py-2.5 text-sm transition-all ${
                mode === m
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              {TRIP_MODE_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "AI 正在规划行程..." : "✨ AI 规划行程"}
      </button>
    </form>
  );
}
