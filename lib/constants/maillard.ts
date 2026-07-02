import type { TripMode } from "@/lib/types/trip";

export const MAILLARD_GRADIENTS: Record<TripMode, string> = {
  commando: "linear-gradient(135deg, #8B4513 0%, #A0522D 100%)",
  relaxed: "linear-gradient(135deg, #C68A54 0%, #DEB887 100%)",
  vacation: "linear-gradient(135deg, #B8860B 0%, #DAA520 100%)",
  foodie: "linear-gradient(135deg, #A0522D 0%, #CD853F 100%)",
  cultural: "linear-gradient(135deg, #6B3A2A 0%, #8B5E3C 100%)",
};

export const MAILLARD_BADGE_COLORS: Record<TripMode, string> = {
  commando: "bg-amber-900/60 text-amber-200 border-amber-700/40",
  relaxed: "bg-orange-900/50 text-orange-200 border-orange-700/40",
  vacation: "bg-yellow-900/50 text-yellow-200 border-yellow-700/40",
  foodie: "bg-red-900/40 text-red-200 border-red-700/40",
  cultural: "bg-stone-800/70 text-stone-200 border-stone-600/40",
};

export const MAILLARD_STATUS_COLORS: Record<string, string> = {
  generated: "bg-blue-900/40 text-blue-200 border-blue-700/40",
  saved: "bg-emerald-900/40 text-emerald-200 border-emerald-700/40",
};

export const TRIP_STATUS_LABELS: Record<string, string> = {
  generated: "AI 生成",
  saved: "已保存",
};

export const CARD_STYLES = {
  rounded: "rounded-2xl",
  transition: "transition-all duration-200 ease-out",
  hover: {
    transform: "hover:-translate-y-1",
    shadow: "hover:shadow-[0_4px_20px_rgba(180,120,60,0.15)]",
    border: "hover:border-amber-500/30",
  },
} as const;
