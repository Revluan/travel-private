import { Show } from "@clerk/nextjs";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative flex h-screen items-center justify-center overflow-hidden">
      <img
        src="/images/scene-1-clouds.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex flex-col items-center px-8 text-center">
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
          规划你的下一次完美旅行
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/60 md:text-xl">
          智能行程编排，从简开始
        </p>
        <div className="mt-8">
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3 text-base font-semibold text-black shadow-lg shadow-amber-500/25 transition-colors hover:bg-amber-400"
            >
              开始规划
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/trips"
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3 text-base font-semibold text-black shadow-lg shadow-amber-500/25 transition-colors hover:bg-amber-400"
            >
              进入工作台
            </Link>
          </Show>
        </div>
      </div>
    </section>
  );
}
