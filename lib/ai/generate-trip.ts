import { generateText } from "ai";
import { defaultModel } from "./deepseek";
import { generatedItinerarySchema } from "./schemas";
import { buildTripPrompt } from "./prompts";
import type { TripConfig, GeneratedItinerary } from "@/lib/types/trip";

export async function generateTrip(
  config: TripConfig,
): Promise<GeneratedItinerary> {
  const prompt = buildTripPrompt(config);

  const result = await generateText({
    model: defaultModel,
    system:
      "你是一位经验丰富的旅行规划师。请根据用户参数输出 JSON 格式的每日行程。你的回复必须是纯 JSON，不要包含 markdown 代码块或其他文字。",
    prompt: `${prompt}\n\n请严格按照以下 JSON 格式输出：\n{\n  "overview": "行程概述",\n  "days": [\n    {\n      "dayNumber": 1,\n      "date": "YYYY-MM-DD",\n      "theme": "当日主题",\n      "activities": [\n        {\n          "time": "HH:mm",\n          "title": "活动名称",\n          "description": "活动描述",\n          "location": "地点名称",\n          "type": "meal|attraction|transport|rest|shopping|other"\n        }\n      ]\n    }\n  ]\n}`,
  });

  const text = result.text.trim();
  // DeepSeek may wrap JSON in ```json blocks
  const jsonStr = text.startsWith("```")
    ? text.replace(/^```json?\s*\n?/, "").replace(/\n?```\s*$/, "")
    : text;

  const parsed = generatedItinerarySchema.parse(JSON.parse(jsonStr));
  return parsed;
}
