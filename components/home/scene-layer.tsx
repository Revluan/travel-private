"use client";

import { useMotionValueEvent, type MotionValue } from "motion/react";
import { useState } from "react";

interface SceneLayerProps {
  src: string;
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
}

export function SceneLayer({ src, opacity, scale }: SceneLayerProps) {
  const [o, setO] = useState(0);
  const [s, setS] = useState(1);

  useMotionValueEvent(opacity, "change", (v) => setO(v));
  useMotionValueEvent(scale, "change", (v) => setS(v));

  return (
    <div
      className="absolute inset-0"
      style={{ opacity: o, transform: `scale(${s})` }}
    >
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/40" />
    </div>
  );
}
