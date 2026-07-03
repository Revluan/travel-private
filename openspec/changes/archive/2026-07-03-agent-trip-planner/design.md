# Design: Agent Trip Planner

## Architecture overview

```
Browser                              Server                              External
───────                              ──────                              ────────

POST /api/trips/generate/agent
  │
  │  SSE stream ──────────────────────────────────────────────▶
  │  event: step-start                                          │
  │  event: tool-call        streamText() + maxSteps=15         │
  │  event: tool-result        │                                 │
  │  event: step-finish        │  ┌─ search_attractions ──────▶ 高德 POI
  │  event: step-start         │  ├─ search_restaurants ──────▶ 高德 POI
  │  event: tool-call          │  ├─ search_hotels     ──────▶ 高德 POI
  │  ...                       │  └─ get_transport     ──────▶ 高德路径规划
  │  event: complete           │                                 │
  │  ◀─────────────────────────┘                                 │
  ▼
AgentStepCard × N  →  最终行程预览
```

## Agent loop (ReAct)

基于 AI SDK v7 的 `streamText` + `maxSteps`：

```typescript
const result = await streamText({
  model: deepseek.chat("deepseek-chat"),
  system: SYSTEM_PROMPT,          // 旅行规划师 persona + 工具使用指南
  messages: [{ role: "user", content: userPrompt }],
  tools: {
    searchAttractions,
    searchRestaurants,
    searchHotels,
    getTransport,
  },
  maxSteps: 15,                   // ReAct 最多 15 轮
  temperature: 0.7,
  onStepFinish: ({ text, toolCalls, toolResults, stepType }) => {
    // 通过 custom data stream 发送给前端
  },
});
```

## Tools

### 1. `search_attractions`

高德 POI 搜索，type=`风景名胜|公园广场|博物馆|展览馆|美术馆|图书馆|文化宫|会展中心|科技馆|天文馆`

```
input:  { city: string, keyword?: string, count?: number }
output: { attractions: { name, address, rating, lng, lat, type }[] }
```

API: `GET https://restapi.amap.com/v3/place/text?key=xxx&keywords=景点&city=上海&types=...&offset=10`

### 2. `search_restaurants`

高德 POI 搜索，type=`餐饮`

```
input:  { city: string, cuisine?: string, count?: number }
output: { restaurants: { name, address, rating, lng, lat, cuisine, avgPrice }[] }
```

API: `GET https://restapi.amap.com/v3/place/text?key=xxx&keywords=本帮菜&city=上海&types=餐饮&offset=10&extensions=all`

### 3. `search_hotels`

高德 POI 搜索，type=`酒店`

```
input:  { city: string, district?: string, count?: number }
output: { hotels: { name, address, rating, lng, lat, priceRange, type }[] }
```

API: `GET https://restapi.amap.com/v3/place/text?key=xxx&keywords=酒店&city=上海&types=酒店&offset=10&extensions=all`

### 4. `get_transport`

高德路径规划 API。支持驾车、步行、公交三种模式。

```
input:  { originLng, originLat, destLng, destLat, mode: "driving"|"walking"|"transit" }
output: { distance, duration, steps: { instruction, road, distance }[], taxiEstimate? }
```

- Driving: `GET https://restapi.amap.com/v3/direction/driving?key=xxx&origin=lng,lat&destination=lng,lat`
- Walking: `GET https://restapi.amap.com/v3/direction/walking?...`
- Transit: `GET https://restapi.amap.com/v3/direction/transit/integrated?key=xxx&origin=lng,lat&destination=lng,lat&city=城市名`

## SSE event format

使用 AI SDK 的 `writeData` 和 `data` stream part 推送自定义事件：

```typescript
// 每个 step 开始时
{ type: "step-start", step: number }

// 每次 tool call
{ type: "tool-call", step: number, tool: string, args: Record<string, unknown> }

// tool 返回结果
{ type: "tool-result", step: number, tool: string, result: unknown }

// step 结束
{ type: "step-finish", step: number, text: string }

// 全部完成
{ type: "complete", itinerary: GeneratedItinerary }
```

前端通过 `fetch` + `ReadableStream` 或 `useChat`（如果协议兼容）读取。

> **注意**：AI SDK v7 的 `streamText` 默认以 text stream 为主。agent step 信息需要通过 `data` stream parts 发送。或者选择用 `generateText` + 手动 SSE（更可控）。具体实现时根据 AI SDK 的实际 API 做适配。

## System prompt

```
你是一位经验丰富的旅行规划师。用户会提供旅行参数（目的地、日期、人数、预算、行程模式）。

你可以使用以下工具来获取真实数据：
- search_attractions: 搜索目的地城市的景点
- search_restaurants: 搜索餐厅和美食
- search_hotels: 搜索酒店住宿
- get_transport: 查询两个地点之间的交通方式

工作流程：
1. 先使用搜索工具了解目的地的景点、餐厅、酒店情况
2. 根据用户的行程模式（特种兵/休闲/度假/美食/文化），筛选合适的地点
3. 使用 get_transport 了解关键地点之间的交通距离
4. 结合所有信息，生成一份详细的每日行程

输出格式为 JSON，包含 overview 和 days 数组。

重要：
- 参数中的日期、人数等细节需保留到输出中
- 工具返回的真实数据（名称、地址、评分）需体现在活动中
- 交通时间要合理，不要安排不可能完成的行程
- 最后一步输出 JSON，不要 markdown 包裹
```

## Component tree

```
app/trips/new/page.tsx          (改造)
  ├── TripForm                  (不变, 已有)
  ├── AgentProgress             (新增, 生成过程中的 step 展示)
  │   └── AgentStepCard × N     (新增, 每个 tool call/think 的卡片)
  └── TripMap                   (不变, 已有)

components/trip/
  ├── trip-form.tsx             (不变)
  ├── agent-step-card.tsx       (新增)
  └── agent-progress.tsx        (新增)
```

## File changes

| Action | File | Purpose |
|--------|------|---------|
| NEW | `lib/agent/tools/search-attractions.ts` | 景点搜索 tool |
| NEW | `lib/agent/tools/search-restaurants.ts` | 餐厅搜索 tool |
| NEW | `lib/agent/tools/search-hotels.ts` | 酒店搜索 tool |
| NEW | `lib/agent/tools/get-transport.ts` | 交通查询 tool |
| NEW | `lib/agent/tools/types.ts` | tool 共享类型 |
| NEW | `lib/agent/prompt.ts` | system prompt |
| NEW | `lib/agent/index.ts` | agent 入口（streamText 封装） |
| NEW | `lib/agent/stream-types.ts` | SSE event 类型定义 |
| NEW | `app/api/trips/generate/agent/route.ts` | SSE API 路由 |
| NEW | `components/trip/agent-step-card.tsx` | Step 卡片组件 |
| NEW | `components/trip/agent-progress.tsx` | 进度容器组件 |
| UPDATE | `app/trips/new/page.tsx` | 集成 agent 流程 + 卡片展示 |

## Risk & mitigation

- **DeepSeek tool call 格式不稳定**：DeepSeek 支持 OpenAI 兼容的 function calling，但偶有格式错误。通过 `maxSteps` 限制最大步数，超时或格式错误时 fallback 到原有单次调用。
- **高德 POI API 费率**：免费版有 QPS 限制（通常 30 QPS），单个 agent 调用可能触发多个 tool call，需在 tool 实现中加简单的 debounce 或缓存。
- **Agent 步数过多导致耗时过长**：`maxSteps=15` 限制，每步有 `temperature` 控制。实际测试后再调整。
- **SSE 连接中断**：前端使用 `AbortController` 允许用户取消；后端检测 `request.signal.aborted` 及时终止。

## Learning checklist (非 blocking)

- [ ] 理解 AI SDK v7 的 `tool()` 定义和 `maxSteps` 机制
- [ ] 理解 ReAct 循环：Think → Act → Observe → Think → ...
- [ ] 理解 SSE 流式通信和 `ReadableStream` API
- [ ] 理解高德 Web API 的 POI 搜索和路径规划接口
