## Context

当前 agent 流程（`lib/agent/index.ts`）分两阶段：

1. **Phase 1 (gathering)**：系统直接调用高德 API 搜索目的地城市的热门景点（10个）、餐厅（10个）、酒店（5个），组成固定 POI 池
2. **Phase 2 (planning)**：为每天并行创建 `ToolLoopAgent`（仅含 `getTransport` 工具），将 POI 池作为 context 喂给模型，"从池子里挑"

问题在于：模型被限定在 25 个固定 POI 中挑选，多天必然重复；模型没有主动搜索能力；流程本末倒置（搜索结果决定了行程，而非行程决定搜索什么）。

此外，Phase 2 的 JSON 解析链路（`extractTextFromResult → extractJSON → normalizeDay → validateCityInDay`）存在缺陷，导致解析失败时 fallback 到"自由活动"。

## Goals / Non-Goals

**Goals:**
- 反转流程：DeepSeek 先基于知识生成完整行程（无工具调用），然后对每个活动调用高德 POI 关键词搜索获取坐标，最后算交通
- 修复 JSON 解析失败导致始终展示"自由活动"的问题
- 单次 LLM 调用生成所有天数（避免天与天之间重复）
- 保持前端 SSE 流式展示体验

**Non-Goals:**
- 不改 API 路由接口（`POST /api/trips/generate/agent` 签名不变）
- 不改 TripForm 和 TripMap 组件
- 不删原有工具文件，但允许重构其调用方式

## Decisions

### Decision 1: 三阶段管线替代 ReAct Agent

```
Phase 1: Plan (LLM, no tools)
  DeepSeek 根据 config 一次性生成 N 天完整行程
  → 输出: { days: [{ dayNumber, date, theme, activities: [{ time, title, description, location, type }] }] }

Phase 2: Geocode (batch Amap POI keyword search)
  对每个 activity，以 activity.title 为 keyword 调用高德 POI 关键词搜索
  → 拿第一个结果的 lng/lat 填入
  → 搜不到的保持 lng/lat 为空（不阻塞流程）

Phase 3: Route (batch Amap routing)
  对每天内相邻的 activity 对，调用高德路径规划
  → 填入 transportTo
```

**Why**: DeepSeek 对国内城市的景点、餐厅、地标的训练知识足够生成合理行程。高德的作用是提供坐标和真实交通信息，而非约束行程内容。这比 ReAct 循环更可控、更快（减少 LLM 调用次数）、且不会因搜索池有限而重复。

**Alternative considered**: 保留 ReAct 循环但给 Agent 加上搜索工具——但 DeepSeek 的 function calling 不够稳定，在 ReAct 循环中容易格式错误或步数爆掉。

### Decision 2: 单次 LLM 调用生成全部天数

当前每天并行调用一个 Agent，各自拿到相同的 POI 池，没有跨天感知。

改为一次 LLM 调用输出所有 `days`，模型能看到完整的行程上下文，自然避免跨天重复。

**Trade-off**: 单次调用 token 消耗更大（prompt 需包含 N 天的 JSON schema 说明），但生成质量更高。对 3-7 天行程，输出 token 在可控范围（每活动约 200 tokens）。

### Decision 3: 高德 POI 关键词搜索替代泛搜

不再调用 `searchAttractions({ city, count: 10 })` 做无关键词的泛搜。改为对每个具体地点名做精准搜索：

```
"外滩" → Amap /v3/place/text?keywords=外滩&city=上海&offset=1
```

取返回第一条结果的坐标。搜不到则跳过（lng/lat 留空）。

**Why**: 精准搜索比泛搜命中率高，且避免了"先搜哪些"的问题。

### Decision 4: 修复 JSON 解析——使用 generateObject 替代 stream + 正则提取

当前解析链路脆弱的核心原因是：用 `ToolLoopAgent.stream()` 输出自由文本、再用正则从文本中挖 JSON。

改为：Phase 1 使用 AI SDK 的 `generateObject` + zod schema，让模型直接返回结构化数据，不需要解析。

**Why**: `generateObject` 内置重试机制，大幅降低解析失败率。这是 AI SDK 的标准做法，不需要自己写 JSON extractor。

### Decision 5: SSE event 结构调整

```
Phase 1: { type: "phase", phase: "planning", message: "正在生成行程..." }
         { type: "day-generated", day, dayNumber, totalDays }  (per day, so N events)

Phase 2: { type: "phase", phase: "geocoding", message: "正在查找地点坐标..." }
         { type: "geocode-result", title: "外滩", success: true, lng, lat }
         ... (M geocode events)

Phase 3: { type: "phase", phase: "routing", message: "正在计算交通..." }
         { type: "route-result", from: "外滩", to: "南京路", mode, duration, distance }
         ... (M route events)

Final:   { type: "complete", itinerary: GeneratedItinerary }
```

## Risks / Trade-offs

- **DeepSeek 生成的地点名在高德中搜不到**: → 降级处理：高德搜不到时 lng/lat 留空，activity 仍保留，地图上不显示该点但不影响行程展示
- **单次 LLM 调用失败（网络/超时）**: → 超时重试一次，仍失败则返回 error event；前端显示错误并提供重试按钮
- **generateObject 输出不符合 schema**: → AI SDK 内置重试，不成功则 fallback 到原有的正则解析 + 恢复逻辑
- **分词/别名问题（"南翔馒头店" vs "南翔馒头"）**: → 高德 POI 搜索本身有一定模糊匹配能力；如果完全搜不到，尝试去掉末尾词（"店""餐厅""公园"等后缀）再搜一次

## Open Questions

- 是否需要保留 `searchAttractions`/`searchRestaurants`/`searchHotels` 作为 fallback 或辅助工具？当前设计用关键词搜索替代了它们，但如果有地点的名称模糊（如用户说"好吃的夜宵店"），泛搜仍有价值。先按移除泛搜实现，Phase 2 不成功时再考虑加回。
- `generateObject` 对 7 天行程的大 JSON 输出是否稳定？如果 DeepSeek 在大输出时容易截断，需要改为 per-day 调用但带上已规划天数的 context。
