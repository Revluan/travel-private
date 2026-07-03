"use client";

import { useEffect, useRef } from "react";
import { load } from "@amap/amap-jsapi-loader";

const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_API_KEY ?? "";
const DEFAULT_CENTER: [number, number] = [116.397428, 39.90923];
const DEFAULT_ZOOM = 4;

export interface RoutePoint {
  lng: number;
  lat: number;
  name?: string;
}

export interface HighlightPoint {
  lng: number;
  lat: number;
  name?: string;
}

interface TripMapProps {
  lat?: number;
  lng?: number;
  routePoints?: RoutePoint[];
  highlightPoint?: HighlightPoint;
  theme?: string;
}

export function TripMap({ lat, lng, routePoints, highlightPoint, theme }: TripMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const loadedRef = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routeMarkersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polylineRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const highlightMarkerRef = useRef<any>(null);

  // Initialize map
  useEffect(() => {
    if (!AMAP_KEY || !containerRef.current || loadedRef.current) return;
    loadedRef.current = true;

    load({
      key: AMAP_KEY,
      version: "2.0",
      plugins: ["AMap.Polyline"],
    })
      .then((AMap) => {
        if (!containerRef.current) return;

        mapRef.current = new (AMap as any).Map(containerRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          mapStyle: "amap://styles/darkblue",
          zoomControl: true,
        });
      })
      .catch(() => {
        // AMap failed to load
      });
  }, []);

  // Single destination marker
  useEffect(() => {
    if (!mapRef.current || lat == null || lng == null) return;
    mapRef.current.setZoomAndCenter(12, [lng, lat]);

    if (markerRef.current) {
      markerRef.current.setPosition([lng, lat]);
    } else {
      const AMapLib = (window as any).AMap;
      if (AMapLib) {
        markerRef.current = new AMapLib.Marker({
          position: [lng, lat],
          map: mapRef.current,
        });
      }
    }
  }, [lat, lng]);

  // Route display
  useEffect(() => {
    if (!mapRef.current || !routePoints || routePoints.length === 0) {
      routeMarkersRef.current.forEach((m: any) => m.setMap(null));
      routeMarkersRef.current = [];
      if (polylineRef.current) polylineRef.current.setMap(null);
      polylineRef.current = null;
      return;
    }

    const map = mapRef.current;
    const path = routePoints.map((p) => [p.lng, p.lat] as [number, number]);

    const AMapLib = (window as any).AMap;
    if (!AMapLib) return;

    routeMarkersRef.current.forEach((m: any) => m.setMap(null));
    routeMarkersRef.current = [];
    if (polylineRef.current) polylineRef.current.setMap(null);

    routePoints.forEach((point, i) => {
      const content = `<div style="background:#3b82f6;color:#fff;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4)">${i + 1}</div>`;
      const marker = new AMapLib.Marker({
        position: [point.lng, point.lat],
        content,
        offset: new AMapLib.Pixel(-10, -10),
        map,
        title: point.name ?? `第${i + 1}站`,
      });
      marker.on("click", () => {
        marker.setLabel({
          content: `<div style="background:#1e293b;color:#e2e8f0;padding:2px 8px;border-radius:4px;font-size:12px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.4)">${point.name ?? `第${i + 1}站`}</div>`,
          offset: new AMapLib.Pixel(0, -30),
        });
      });
      routeMarkersRef.current.push(marker);
    });

    polylineRef.current = new AMapLib.Polyline({
      path,
      strokeColor: "#3b82f6",
      strokeWeight: 4,
      strokeOpacity: 0.7,
      lineJoin: "round",
      lineCap: "round",
      showDir: true,
      map,
    });

    map.setFitView(null, false, [60, 60, 60, 60]);
  }, [routePoints]);

  // Theme-based map style
  useEffect(() => {
    if (!mapRef.current) return;
    const style = theme === "light" ? "amap://styles/normal" : "amap://styles/darkblue";
    mapRef.current.setMapStyle(style);
  }, [theme]);

  // Single highlight point (individual activity click in preview)
  useEffect(() => {
    if (!mapRef.current) return;

    if (highlightMarkerRef.current) {
      highlightMarkerRef.current.setMap(null);
      highlightMarkerRef.current = null;
    }

    if (!highlightPoint) return;

    const AMapLib = (window as any).AMap;
    if (!AMapLib) return;

    mapRef.current.setZoomAndCenter(14, [highlightPoint.lng, highlightPoint.lat]);

    const content = `<div style="background:#f59e0b;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;border:3px solid #fff;box-shadow:0 2px 8px rgba(245,158,11,.5);animation:pulse 1.5s ease-in-out infinite">★</div>`;
    highlightMarkerRef.current = new AMapLib.Marker({
      position: [highlightPoint.lng, highlightPoint.lat],
      content,
      offset: new AMapLib.Pixel(-12, -12),
      map: mapRef.current,
      title: highlightPoint.name ?? "",
      zIndex: 200,
    });

    // Show label on the highlighted marker
    if (highlightPoint.name) {
      highlightMarkerRef.current.setLabel({
        content: `<div style="background:#1e293b;color:#f59e0b;padding:3px 10px;border-radius:6px;font-size:13px;font-weight:600;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.5);border:1px solid rgba(245,158,11,.3)">${highlightPoint.name}</div>`,
        offset: new AMapLib.Pixel(0, -36),
      });
    }
  }, [highlightPoint]);

  if (!AMAP_KEY) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/30">
        <p className="text-sm text-zinc-500">请配置 NEXT_PUBLIC_AMAP_API_KEY</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[400px] w-full rounded-xl border border-zinc-700 bg-zinc-800/30"
    />
  );
}
