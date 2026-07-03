# Tasks: Fix Agent Planning Flow

## 1. Schema & prompt for plan-first approach

- [x] 1.1 在 `lib/types/trip.ts` 中创建 `GeneratedItinerary` 的 zod schema（如 `itinerarySchema`），供 `generateObject` 使用
- [x] 1.2 重写 `lib/agent/prompt.ts`：移除原有 DAY_PLAN_PROMPT 和 GATHER_PROMPT，新增 `PLAN_PROMPT`——用于让 LLM 一次性生成全部天数的完整行程（不含工具调用）
- [x] 1.3 在 prompt 中明确约束：禁止跨天重复的 activity title；每天 activity 数按 mode 控制；坐标暂时留空

## 2. Phase 1: LLM 全量规划

- [x] 2.1 改造 `lib/agent/index.ts`：将 Phase 1（gathering）替换为使用 `generateObject` + zod schema 调用 DeepSeek，一次性生成全部天数
- [x] 2.2 对每天输出 `day-generated` SSE event，让前端逐步展示行程卡片
- [x] 2.3 移除原有的 `planSingleDay`、`buildDayPrompt`、`extractTextFromResult`、`extractJSON`、`normalizeDay`、`recoverActivities` 等不再需要的函数

## 3. Phase 2: 高德 POI 关键词搜索获取坐标

- [x] 3.1 新增 `lib/agent/tools/search-place-by-name.ts`（或复用现有工具），实现 `searchPlaceByName(name, city)`：以地点名为关键词调高德 POI 文本搜索，取第一条结果
- [x] 3.2 在 `lib/agent/index.ts` 中实现 geocoding 阶段：遍历所有 activity，并行调用 `searchPlaceByName`，将坐标填入 activity
- [x] 3.3 对高德搜索无结果的情况：尝试去掉末尾后缀词（"店""餐厅""公园""广场"等）再搜一次；仍无结果则 lng/lat 留空
- [x] 3.4 每完成一个地点坐标获取，推送 `geocode-result` SSE event

## 4. Phase 3: 高德路径规划计算交通

- [x] 4.1 在 `lib/agent/index.ts` 中实现 routing 阶段：对每天相邻的 activity 对（都有有效坐标的）并行调用 getTransport
- [x] 4.2 将 getTransport 结果填入前一个 activity 的 `transportTo`
- [x] 4.3 每完成一条路线计算，推送 `route-result` SSE event

## 5. SSE event 结构更新

- [x] 5.1 更新 `lib/agent/stream-types.ts`：新增 `geocode-result` 和 `route-result` event 类型，调整 phase 可选值
- [x] 5.2 调整 `createAgentSSE` 中的三阶段 emit 顺序：planning → geocoding → routing → complete
- [x] 5.3 保留 `ToolCallEvent` 和 `ToolResultEvent` 类型定义（geocode-result 和 route-result 用这些或新类型均可），确保 `buildToolResultSummary` 兼容

## 6. 前端组件适配

- [x] 6.1 更新 `components/trip/agent-progress.tsx`：适配新的 phase 值和 event 类型，geocoding/routing 阶段展示对应卡片
- [x] 6.2 更新 `components/trip/agent-step-card.tsx`：适配 geocode-result 和 route-result 两种新事件类型的渲染

## 7. 清理与回归验证

- [x] 7.1 评估并清理不再需要的代码：`planSingleDay`、`buildDayPrompt`、`parseDayOutput`、`extractJSON`、`matchBrackets`、`validateCityInDay`、`recoverActivities`、`normalizeDay`、`extractTextFromResult`、`runTool`（Phase 1 的 helper）
- [x] 7.2 确保非 Agent 路径 `POST /api/trips/generate` 不受影响，原有流程正常运行
- [ ] 7.3 端到端测试：提交行程配置 → 看到三阶段进度 → 行程正确展示坐标和交通 → 保存 → 跳转详情页
