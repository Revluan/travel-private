"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plane, AlertTriangle, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { getAllProvinces, getCityCodes } from "@/lib/flights/data";

const AMAP_WEB_KEY = process.env.NEXT_PUBLIC_AMAP_WEB_KEY ?? "";

interface FlightOffer {
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  price: number;
  currency: string;
  stops: number;
}

interface CityResult {
  city: string;
  airportCode: string;
  airportName: string;
  flights: FlightOffer[];
  lowestPrice: number | null;
  error?: string;
}

interface SkiplagDeal {
  beyondCity: string;
  beyondCode: string;
  flight: FlightOffer;
  savedAmount: number;
  savedPercent: number;
}

interface Suggestion {
  name: string;
  lng: number;
  lat: number;
}

export default function FlightsPage() {
  // Form state
  const [originInput, setOriginInput] = useState("");
  const [originCity, setOriginCity] = useState("");
  const [originCodes, setOriginCodes] = useState<string[]>([]);
  const [province, setProvince] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Origin autocomplete
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const originContainerRef = useRef<HTMLDivElement>(null);

  // Results state
  const [results, setResults] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Skiplag state
  const [skiplagDeals, setSkiplagDeals] = useState<Record<string, SkiplagDeal[]>>({});
  const [skiplagLoading, setSkiplagLoading] = useState(false);
  const [showSkiplag, setShowSkiplag] = useState(true);
  const [expandedCities, setExpandedCities] = useState<Record<string, boolean>>({});

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (originContainerRef.current && !originContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOriginInput = (value: string) => {
    setOriginInput(value);
    setOriginCity("");
    setOriginCodes([]);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://restapi.amap.com/v3/config/district?key=${AMAP_WEB_KEY}&keywords=${encodeURIComponent(value)}&subdistrict=0`
        );
        const data = await res.json();
        if (data.status !== "1" || !data.districts) return;
        const tips: Suggestion[] = [];
        for (const d of data.districts) {
          if (d.center && d.name && (d.level === "city" || d.level === "province")) {
            const [lng, lat] = d.center.split(",").map(Number);
            if (!isNaN(lng) && !isNaN(lat)) {
              tips.push({ name: d.name, lng, lat });
            }
          }
        }
        setSuggestions(tips);
        setShowSuggestions(tips.length > 0);
      } catch {
        // ignore
      }
    }, 300);
  };

  const handleOriginSelect = (s: Suggestion) => {
    const cityName = s.name.replace(/市$/, "");
    const codes = getCityCodes(cityName);
    setOriginInput(cityName);
    setOriginCity(cityName);
    setOriginCodes(codes);
    setShowSuggestions(false);
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!originCity || originCodes.length === 0) next.origin = "请选择出发城市";
    if (!province) next.province = "请选择目标省份";
    if (!departureDate) next.departureDate = "请选择出发日期";
    if (departureDate && departureDate < new Date().toISOString().slice(0, 10)) {
      next.departureDate = "出发日期不能是过去";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSearched(true);
    setResults([]);
    setSkiplagDeals({});
    setExpandedCities({});

    try {
      const originCode = originCodes[0]; // use first airport code
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originCode, province, departureDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ form: data.error || "搜索失败" });
        setLoading(false);
        return;
      }
      setResults(data.results ?? []);

      // Auto-expand first 3 cities
      const expand: Record<string, boolean> = {};
      (data.results ?? []).slice(0, 3).forEach((r: CityResult) => {
        expand[r.airportCode] = true;
      });
      setExpandedCities(expand);

      // Async skiplag scan
      if (data.results?.length > 0) {
        setSkiplagLoading(true);
        const deals: Record<string, SkiplagDeal[]> = {};
        for (const result of data.results as CityResult[]) {
          if (result.lowestPrice == null) continue;
          try {
            const sr = await fetch("/api/flights/skiplag", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                originCode,
                destCode: result.airportCode,
                directLowestPrice: result.lowestPrice,
                departureDate,
              }),
            });
            const sd = await sr.json();
            if (sd.deals?.length > 0) {
              deals[result.airportCode] = sd.deals;
              // Auto expand cities with skiplag deals
              expand[result.airportCode] = true;
            }
          } catch {
            // skip failed skiplag for individual city
          }
        }
        setSkiplagDeals(deals);
        setExpandedCities({ ...expand });
        setSkiplagLoading(false);
      }
    } catch {
      setErrors({ form: "搜索失败，请重试" });
    }
    setLoading(false);
  };

  const toggleExpand = (code: string) => {
    setExpandedCities((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const formatTime = (iso: string) => {
    if (!iso) return "--:--";
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const provinces = getAllProvinces();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">机票搜索</h1>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-6 mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Origin */}
          <div className="space-y-1.5" ref={originContainerRef}>
            <label className="text-sm font-medium text-zinc-400">出发地</label>
            <div className="relative">
              <input
                type="text"
                value={originInput}
                onChange={(e) => handleOriginInput(e.target.value)}
                placeholder="输入城市名称..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              {showSuggestions && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-zinc-700 bg-zinc-800 shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleOriginSelect(s)}
                      className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700/50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.origin && <p className="text-xs text-red-400">{errors.origin}</p>}
          </div>

          {/* Province */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400">目的地（省份）</label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
            >
              <option value="">选择省份...</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.shortName}>
                  {p.shortName}（{p.airportCount}个机场）
                </option>
              ))}
            </select>
            {errors.province && <p className="text-xs text-red-400">{errors.province}</p>}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-400">出发日期</label>
            <input
              type="date"
              value={departureDate}
              min={today}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            {errors.departureDate && <p className="text-xs text-red-400">{errors.departureDate}</p>}
          </div>
        </div>

        {errors.form && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {errors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-2">
            <Search className="h-4 w-4" />
            {loading ? "搜索中..." : "搜索机票"}
          </span>
        </button>
      </form>

      {/* Filter Toggle */}
      {searched && (
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowSkiplag(!showSkiplag)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
              showSkiplag
                ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                : "border-zinc-700 text-zinc-500"
            }`}
          >
            甩尾航班 {showSkiplag ? "ON" : "OFF"}
          </button>
          {searched && !loading && (
            <p className="text-xs text-zinc-500">
              {results.length} 个城市
              {skiplagLoading && " · 正在寻找甩尾航班..."}
            </p>
          )}
        </div>
      )}

      {/* Empty state */}
      {searched && !loading && results.length === 0 && (
        <div className="text-center py-16 text-zinc-500">
          <Plane className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>未找到航班结果</p>
          <p className="text-sm mt-1">尝试调整搜索条件</p>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {results.map((result) => {
          const isExpanded = expandedCities[result.airportCode] ?? false;
          const deals = showSkiplag ? (skiplagDeals[result.airportCode] ?? []) : [];

          return (
            <div
              key={result.airportCode}
              className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl overflow-hidden"
            >
              {/* City header */}
              <button
                type="button"
                onClick={() => toggleExpand(result.airportCode)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Plane className="h-4 w-4 text-zinc-500" />
                  <div className="text-left">
                    <span className="text-white font-medium">{result.city}</span>
                    <span className="text-zinc-500 text-sm ml-2">
                      {result.airportCode} {result.airportName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {result.lowestPrice != null ? (
                    <span className="text-amber-400 font-semibold text-lg">
                      ¥{result.lowestPrice.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-zinc-500 text-sm">{result.error || "无直飞航班"}</span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-500" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-zinc-700/50">
                  {/* Direct flights */}
                  <div className="px-5 py-3">
                    <h4 className="text-xs font-medium text-zinc-500 uppercase mb-2">直飞航班</h4>
                    {result.flights.length === 0 ? (
                      <p className="text-sm text-zinc-600">暂无直飞航班</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-zinc-500 text-xs">
                            <th className="text-left font-normal py-1">航空公司</th>
                            <th className="text-left font-normal py-1">航班号</th>
                            <th className="text-left font-normal py-1">出发</th>
                            <th className="text-left font-normal py-1">到达</th>
                            <th className="text-right font-normal py-1">价格</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.flights.map((f, i) => (
                            <tr key={i} className="border-t border-zinc-700/30">
                              <td className="py-2 text-zinc-300">{f.airline}</td>
                              <td className="py-2 text-zinc-400">{f.flightNumber}</td>
                              <td className="py-2 text-zinc-300">{formatTime(f.departureTime)}</td>
                              <td className="py-2 text-zinc-300">{formatTime(f.arrivalTime)}</td>
                              <td className="py-2 text-right">
                                <span className="text-amber-400 font-medium">
                                  ¥{f.price.toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Skiplag deals */}
                  {deals.length > 0 && (
                    <div className="border-t border-zinc-700/50 px-5 py-3">
                      <h4 className="text-xs font-medium text-amber-500 uppercase mb-2 flex items-center gap-1.5">
                        🔥 甩尾航班
                      </h4>
                      <div className="space-y-2">
                        {deals.map((deal, i) => (
                          <div
                            key={i}
                            className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-zinc-300">{deal.flight.airline}</span>
                                <span className="text-zinc-500">{deal.flight.flightNumber}</span>
                                <ArrowRight className="h-3 w-3 text-zinc-600" />
                                <span className="text-zinc-300">
                                  {result.city} → {deal.beyondCity}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-amber-400 font-semibold">
                                  ¥{deal.flight.price.toLocaleString()}
                                </span>
                                <span className="text-green-400 text-xs ml-2">
                                  省 ¥{deal.savedAmount.toLocaleString()}（{deal.savedPercent}%）
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-500/70">
                              <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              <span>
                                甩尾航班：购买 {result.city}→{deal.beyondCity} 全程票，在{result.city}下机放弃后半程。不可托运行李，不可买往返票。违反航司运输条款，请自行评估风险。
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
