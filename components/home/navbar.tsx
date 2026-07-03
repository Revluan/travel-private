"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Compass, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors">
          <Compass className="h-6 w-6" />
          <span className="font-semibold tracking-tight">旅行规划</span>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/app/flights" className="text-sm text-white/60 transition-colors hover:text-white/90">
            机票搜索
          </Link>
          <Link href="/trips" className="text-sm text-white/60 transition-colors hover:text-white/90">
            行程规划
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="rounded-full p-2 text-white/60 hover:text-white/90 hover:bg-white/10 transition-all"
            aria-label="切换主题"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        )}
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm hover:bg-white/20 hover:text-white transition-all">
              登录
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <Link
            href="/trips"
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm hover:bg-white/20 hover:text-white transition-all"
          >
            工作台
          </Link>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 ring-1 ring-white/20",
              },
            }}
          />
        </Show>
      </div>
    </nav>
  );
}
