## Why

当前行程中的每个地点（活动）只有名称、位置、时间等基础信息，缺少对地点本身亮点的描述。用户查看行程时无法快速了解"这个地方有什么特别的"以及"为什么值得去"。在 LLM 已经生成了行程的基础上，增加这三个维度的元数据能显著提升行程规划的阅读价值和决策参考性。

## What Changes

- LLM 生成的每个 `PlannedActivity` 新增三个可选字段：`highlights`（地点特点描述）、`tags`（3 个关键词标签）、`recommendation`（≤20 字推荐语）
- Agent 路径的 `PLAN_PROMPT` 和非 Agent 路径的 `buildTripPrompt` 同步更新，要求 LLM 输出新字段
- `AgentStepCard` 组件展示标签和推荐语——同时影响行程预览页（`/trips/new`）和行程详情页（`/trips/[id]`）
- Zod schema 和 API 保存接口同步放宽，接受新字段
- 新字段均为 optional，兼容所有旧数据

## Capabilities

### New Capabilities

- `place-metadata`: LLM 在生成行程时为每个地点输出 highlights（特点描述）、tags（3 个关键词标签）、recommendation（≤20 字推荐语），前端在预览和详情页展示

### Modified Capabilities

- `plan-first-then-enrich`: `plannedActivitySchema` 新增三个可选字段；PLAN_PROMPT 增加对应输出要求
- `trip-planner`: REQ-005 涉及的详情页展示和 REQ-004 涉及的预览页展示，增加标签和推荐语的渲染

## Impact

- `lib/types/trip.ts` — `PlannedActivity` 接口新增字段
- `lib/ai/schemas.ts` — `plannedActivitySchema` zod schema 新增字段
- `lib/agent/prompt.ts` — `PLAN_PROMPT` 新增输出要求
- `lib/ai/prompts.ts` — `buildTripPrompt` 新增输出要求
- `components/trip/agent-step-card.tsx` — 渲染标签和推荐语
- `app/api/trips/route.ts` — save schema 接受新字段（jsonb 列无需 migration）
