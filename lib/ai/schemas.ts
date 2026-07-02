import { z } from "zod";
import { ACTIVITY_TYPES } from "@/lib/types/trip";

export const plannedActivitySchema = z.object({
  time: z.string().describe("活动时间，格式 HH:mm，如 08:00"),
  title: z.string().describe("活动名称"),
  description: z.string().describe("活动描述，1-2 句话"),
  location: z.string().describe("活动地点名称"),
  type: z.enum(ACTIVITY_TYPES).describe("活动类型"),
});

export const generatedDaySchema = z.object({
  dayNumber: z.number().int().positive().describe("第几天，从 1 开始"),
  date: z.string().describe("日期，格式 YYYY-MM-DD"),
  theme: z.string().describe("当日主题，如 '城市探索'、'文化沉浸'"),
  activities: z
    .array(plannedActivitySchema)
    .min(1)
    .describe("当天活动列表"),
});

export const generatedItinerarySchema = z.object({
  overview: z.string().describe("总行程概述，2-4 句话描述整体行程安排"),
  days: z.array(generatedDaySchema).min(1).describe("每日行程列表"),
});
