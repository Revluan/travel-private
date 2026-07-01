"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

const HIGHLIGHTS = [
  {
    image: "/images/scene-2-mountains.webp",
    title: "像翻杂志一样规划行程",
    description: "每个目的地就是一章，每个活动就是一页，翻阅间勾勒出你的旅行故事。",
  },
  {
    image: "/images/scene-3-coast.webp",
    title: "所见即所得的时间线",
    description: "天与天之间清晰分明，拖拽调整即刻生效，不用刷新、不用等待。",
    reverse: true,
  },
];

export function HighlightsSection() {
  return (
    <section className="bg-[#0a0e17] py-32">
      <div className="mx-auto max-w-6xl px-6">
        {HIGHLIGHTS.map((item, i) => (
          <HighlightRow key={i} {...item} />
        ))}
      </div>
    </section>
  );
}

function HighlightRow({
  image,
  title,
  description,
  reverse,
}: {
  image: string;
  title: string;
  description: string;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className={`mb-24 flex flex-col items-center gap-12 last:mb-0 md:flex-row ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      <div className="flex-1">
        <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
          <img src={image} alt={title} className="h-72 w-full object-cover md:h-96" loading="lazy" />
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h3>
        <p className="mt-4 text-lg leading-relaxed text-white/40">{description}</p>
      </div>
    </motion.div>
  );
}
