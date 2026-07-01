"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative overflow-hidden bg-[#060a10] py-40">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)]" />

      <motion.div
        ref={ref}
        className="relative mx-auto max-w-2xl px-6 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
          准备好出发了吗？
        </h2>
        <p className="mt-4 text-lg text-white/40">
          免费开始，没有限制。
        </p>
        <div className="mt-10">
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-400 hover:to-cyan-400 hover:shadow-blue-500/40"
            >
              开始规划
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/app"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-400 hover:to-cyan-400 hover:shadow-blue-500/40"
            >
              进入工作台
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Show>
        </div>
      </motion.div>
    </section>
  );
}
