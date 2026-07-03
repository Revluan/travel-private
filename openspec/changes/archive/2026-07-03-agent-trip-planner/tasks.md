# Tasks: Agent Trip Planner

## Phase 1: Tool 基础层（无 Agent）

- [x] **T1** — 创建 `lib/agent/tools/types.ts`，定义 tool 共享类型（ToolInput, ToolOutput, 高德 POI 响应类型）
- [x] **T2** — 实现 `lib/agent/tools/search-attractions.ts`，调用高德 POI 搜索 API（types=风景名胜|博物馆|公园等），输入 { city, keyword?, count? }，返回景点列表
- [x] **T3** — 实现 `lib/agent/tools/search-restaurants.ts`，调用高德 POI 搜索 API（types=餐饮），输入 { city, cuisine?, count? }，返回餐厅列表（含人均价格）
- [x] **T4** — 实现 `lib/agent/tools/search-hotels.ts`，调用高德 POI 搜索 API（types=酒店），输入 { city, district?, count? }，返回酒店列表（含价格区间）
- [x] **T5** — 实现 `lib/agent/tools/get-transport.ts`，调用高德路径规划 API（驾车/步行/公交），输入 { originLng, originLat, destLng, destLat, mode }，返回距离、耗时、路线
- [x] **T6** — 为每个 tool 编写单元测试（mock 高德 API 响应），验证参数解析和返回格式

## Phase 2: Agent 核心

- [x] **T7** — 创建 `lib/agent/prompt.ts`，编写 system prompt（旅行规划师 persona + 工具使用说明 + 输出格式约束）
- [x] **T8** — 创建 `lib/agent/stream-types.ts`，定义 SSE event 类型（StepStart, ToolCall, ToolResult, StepFinish, Complete, Error）
- [x] **T9** — 创建 `lib/agent/index.ts`，基于 AI SDK `streamText` + `maxSteps=15` 封装 agent，注册 4 个 tools，onStepFinish 中推送自定义 event 到 data stream
- [x] **T10** — 创建 `app/api/trips/generate/agent/route.ts`，SSE POST 接口，接收 TripConfig，调用 agent，流式返回 step events

## Phase 3: 前端 Agent UI

- [x] **T11** — 创建 `components/trip/agent-step-card.tsx`，渲染单个 step 的卡片（3 种 variant：thinking / tool-loading / tool-done / tool-error）
- [x] **T12** — 创建 `components/trip/agent-progress.tsx`，管理 step 列表和滚动，接收 SSE events 并逐步追加 step cards
- [x] **T13** — 改造 `app/trips/new/page.tsx`，点击提交后切换到 SSE 流式模式，展示 AgentProgress 组件，完成后展示行程预览 + "保存" / "重新生成" 按钮
- [x] **T14** — 实现取消功能：AbortController 中断 SSE + 后端检测 `request.signal.aborted`

## Phase 4: 集成验证

- [ ] **T15** — 端到端测试：提交上海 3 日美食游 → agent 调用 tools → 前端逐步展示 → 保存行程 → 跳转详情页
- [ ] **T16** — 验证错误场景：高德 API 失败时 tool 返回 error → agent 跳过/重试 → 前端卡片显示错误状态
- [ ] **T17** — 验证取消场景：agent 运行中点击取消 → SSE 中断 → 前端恢复表单状态
- [x] **T18** — 回归验证：POST `/api/trips/generate`（非 agent）仍正常工作

## Dependencies

```
Phase 1 (T1→T2,T3,T4,T5→T6)
    ↓
Phase 2 (T7,T8→T9→T10)
    ↓
Phase 3 (T11,T12→T13→T14)
    ↓
Phase 4 (T15,T16,T17,T18)
```
