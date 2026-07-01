"use client";

import { useMotionValueEvent, type MotionValue } from "motion/react";
import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

interface SceneContentProps {
  title: string;
  subtitle: string;
  opacity: MotionValue<number>;
  showCta?: boolean;
}

export function SceneContent({ title, subtitle, opacity, showCta }: SceneContentProps) {
  const [o, setO] = useState(0);

  useMotionValueEvent(opacity, "change", (v) => setO(v));

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center"
      style={{ opacity: o }}
    >
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white drop-shadow-lg md:text-6xl">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-lg text-white/60 drop-shadow-md md:text-xl">
        {subtitle}
      </p>
      {showCta && (
        <div className="mt-8">
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3 text-base font-semibold text-black shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-500/40"
            >
              开始规划
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3 text-base font-semibold text-black shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:shadow-amber-500/40"
            >
              进入工作台
            </Link>
          </Show>
        </div>
      )}
    </div>
  );
}
