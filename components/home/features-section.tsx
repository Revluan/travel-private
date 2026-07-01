"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Map, GripHorizontal, Sparkles } from "lucide-react";

const FEATURES = [
  {
    icon: Map,
    title: "多目的地规划",
    description: "无需来回切换，一个行程串联多个城市，全局视角一目了然。",
  },
  {
    icon: GripHorizontal,
    title: "拖拽式编排",
    description: "直觉操作，拖动即可调整日程顺序，所见即所得。",
  },
  {
    icon: Sparkles,
    title: "AI 智能推荐",
    description: "根据你的偏好和节奏，推荐合适的景点、餐厅和交通方式。",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-[#0a0e17] py-32">
      <div className="mx-auto max-w-6xl px-6">
        <motion.h2
          className="text-center text-3xl font-semibold tracking-tight text-white md:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          ref={ref}
        >
          一切从简，但不止于此
        </motion.h2>
        <motion.p
          className="mt-4 text-center text-white/40"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          规划旅行应该像旅行本身一样愉快
        </motion.p>

        <motion.div
          className="mt-16 grid gap-6 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 ring-1 ring-blue-500/20">
                <feature.icon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/40">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
