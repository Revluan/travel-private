"use client";

import { motion, useMotionValue, useMotionTemplate } from "motion/react";
import { useEffect, useState } from "react";

export function WindowFrame() {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const [showReflection, setShowReflection] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) setShowReflection(false);
    const handler = (e: MediaQueryListEvent) => setShowReflection(!e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const reflectionX = useMotionTemplate`${mouseX}`;
  const reflectionY = useMotionTemplate`${mouseY}`;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-[5vw]" onMouseMove={handleMouseMove}>
      {/* Cabin shadows — dark sides that create the "inside the plane" feel */}
      <div className="absolute inset-0 bg-[#060a10]/80" />

      {/* The window cutout */}
      <div className="relative h-full w-full max-h-[75vh] max-w-[85vw]">
        {/* Window border — rounded rectangle with glass edge */}
        <div className="absolute inset-0 rounded-[48px] ring-1 ring-white/15 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]" />

        {/* Inner border highlight */}
        <div className="absolute inset-[2px] rounded-[46px] ring-1 ring-white/8" />

        {/* Glass reflection sweep — follows mouse */}
        {showReflection && (
          <motion.div
            className="absolute inset-0 rounded-[48px] opacity-30"
            style={{
              background: useMotionTemplate`radial-gradient(ellipse at ${reflectionX} ${reflectionY}, rgba(255,255,255,0.12) 0%, transparent 60%)`,
            }}
          />
        )}

        {/* Corner vignette */}
        <div
          className="absolute inset-0 rounded-[48px]"
          style={{
            background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)",
          }}
        />
      </div>
    </div>
  );
}
