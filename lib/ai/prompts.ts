import { TripConfig, TRIP_MODE_LABELS } from "@/lib/types/trip";

const MODE_INSTRUCTIONS: Record<string, string> = {
  commando:
    "行程节奏紧凑，最大化景点覆盖，每天安排 5-8 个活动，早起晚归，高效利用时间。",
  relaxed:
    "行程节奏舒适，每天安排 3-5 个活动，留足休息和自由探索时间，注重体验而非数量。",
  vacation:
    "以放松为核心，每天安排 3-4 个活动，侧重度假体验（海滩、SPA、美食），不赶景点。",
  foodie:
    "以美食为主线，每天安排 4-6 个活动，围绕知名餐厅、本地小吃、市场等展开，穿插少量景点。",
  cultural:
    "以文化探索为重点，每天安排 4-6 个活动，侧重博物馆、历史遗迹、本地传统体验。",
};

export function buildTripPrompt(config: TripConfig): string {
  const modeLabel = TRIP_MODE_LABELS[config.mode];
  const modeInstruction = MODE_INSTRUCTIONS[config.mode];
  const budgetText = config.budget ? `${config.budget.toLocaleString()} 元` : "不限";

  return `你是一位专业的旅行规划师。请根据以下用户参数，规划一份详细的每日行程。

目的地：${config.destination.name}（${config.destination.formattedAddress}）
日期：${config.startDate} 至 ${config.endDate}（共 ${config.days} 天）
人数：${config.peopleCount} 人
预算：${budgetText}
行程模式：${modeLabel}

${modeInstruction}

要求：
- 活动时间需考虑合理的交通和用餐间隔
- 每个活动的描述需具体，包含具体地点或方式
- 每天的主题应与当天的活动内容一致
- 活动地点名称使用当地语言（中文）
- 为每个活动额外输出地点元数据：
  - highlights: 1-2 句话描述该地点本身的特点和亮点
  - tags: 3 个关键词标签组成的数组
  - recommendation: 一句推荐语，不超过 20 字`;
}
