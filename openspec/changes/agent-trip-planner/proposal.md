# Proposal: Agent Trip Planner

## Why

当前行程生成是单次 DeepSeek 调用 —— 模型没有真实数据，行程质量依赖训练知识的时效性。用户想要一个基于 ReAct Agent 的方案：模型自行决定何时查酒店、景点、餐厅、交通，用真实数据支持推理，且前端能展示每一步的思考过程。

这既是功能升级，也是 agent 开发的实践学习。

## What changes

- **新增 4 个 agent tools**：`search_attractions`、`search_restaurants`、`search_hotels`、`get_transport`，数据源为高德 POI 搜索和高德路径规划 API，使用项目已有的 AMAP_WEB_KEY。
- **新建 agent 核心** `lib/agent/`，基于 Vercel AI SDK v7 的 `streamText` + `maxSteps` 实现 ReAct 循环，使用 DeepSeek 模型。
- **新增 SSE 接口** `POST /api/trips/generate/agent`，流式推送每一步的工具调用和结果。
- **改造 `/trips/new` 页面**，将原来的"一键生成 + 跳转等待"替换为逐步展示：每个 tool call 渲染为卡片（含 loading → 完成状态），最终展示生成的行程概览。
- **保留原有 `/api/trips/generate` 不变**（非 agent 路径作为 fallback）。

## Impact

- 新增 spec：`agent-trip-planner`
- 关联 spec：`trip-planner`（REQ-004 AI 生成部分将被 agent 路径替代）
- 新增文件：`lib/agent/`（~6 files），`app/api/trips/generate/agent/route.ts`
- 修改文件：`app/trips/new/page.tsx`，可能抽象出 `AgentStepCard` 组件
