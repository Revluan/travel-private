"use client";

import { useEffect, useRef } from "react";
import { load } from "@amap/amap-jsapi-loader";

const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_API_KEY ?? "";
const DEFAULT_CENTER: [number, number] = [116.397428, 39.90923]; // Beijing
const DEFAULT_ZOOM = 4;

interface TripMapProps {
  lat?: number;
  lng?: number;
}

export function TripMap({ lat, lng }: TripMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<AMap.Map | null>(null);
  const markerRef = useRef<AMap.Marker | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!AMAP_KEY || !containerRef.current || loadedRef.current) return;
    loadedRef.current = true;

    load({
      key: AMAP_KEY,
      version: "2.0",
    })
      .then((AMap) => {
        if (!containerRef.current) return;

        mapRef.current = new AMap.Map(containerRef.current, {
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

  useEffect(() => {
    if (!mapRef.current || lat == null || lng == null) return;
    mapRef.current.setZoomAndCenter(12, [lng, lat]);

    if (markerRef.current) {
      markerRef.current.setPosition([lng, lat]);
    } else {
      markerRef.current = new AMap.Marker({
        position: [lng, lat],
        map: mapRef.current,
      });
    }
  }, [lat, lng]);

  if (!AMAP_KEY) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/30">
        <p className="text-sm text-zinc-500">
          请配置 NEXT_PUBLIC_AMAP_API_KEY
        </p>
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
