## Context

当前 `/trips/[id]` 是单栏编辑器（`max-w-2xl` 居中），所有字段可编辑，无地图。`/trips/new` 预览阶段已经是双栏布局（左侧 560px 行程 + 右侧地图），`AgentStepCard`、`TripMap` 和 Day tabs 交互都已就绪。本次改造将这些已有组件和交互直接复用到详情页，变编辑器为纯展示。

## Goals / Non-Goals

**Goals:**
- `/trips/[id]` 改为左侧行程 + 右侧地图的双栏纯展示布局
- 复用 `AgentStepCard` 展示每天行程（替代 DayCard）
- 复用 `TripMap` 展示路线折线和活动高亮
- Day tabs 切换显示每天路线
- 补上 API 层 Zod schema 缺失的坐标字段，确保 `lng`/`lat`/`transportTo` 落库

**Non-Goals:**
- 不保留编辑功能（不再需要 TripOverview、DayCard、ActivityRow 的编辑能力）
- 不增加新的地图交互（完全复用 TripMap 已有的）

## Decisions

### Decision 1: 完全复用 `/trips/new` 的 preview 布局结构

**选择**: 将 `/trips/new` preview 阶段的 JSX 结构（概览卡片 + Day tabs + AgentStepCard 列表 + TripMap）搬到 `/trips/[id]`，数据源从 state machine 换成 `GET /api/trips/[id]` 的 fetch 结果。

**理由**: 两个页面的数据模型兼容（`TripWithDays` ≈ `GeneratedItinerary`），组件已存在且经过验证。不需要任何新组件。

**替代方案**: 抽取共享的 `ItineraryPreview` 组件。但两页面的交互逻辑有细微差异（详情页无保存/重新生成按钮），提取过早会增加不必要的抽象复杂度。如果后续有第三个页面需要相同布局，届时再抽取。

### Decision 2: 坐标字段通过更新 Zod schema 修复

**选择**: 在 POST `/api/trips` 和 PUT `/api/trips/[id]` 的 Zod schema 中，activities 的 object 增加 `lng`、`lat`、`transportTo` 可选字段。

**理由**: JSONB 列天然支持这些字段，不需要数据库迁移。唯一的阻断点是 Zod 校验把它们 strip 了。加上即可。

### Decision 3: 不再需要 TripOverview、DayCard、ActivityRow 组件

**选择**: 这三个编辑组件不再被使用，但暂不删除（保持 minimal diff）。

**理由**: 如果未来需要编辑模式，可能需要恢复。但本 change 范围内它们不需要改动，也不引入新引用。

## Risks / Trade-offs

- **已有行程没有坐标数据** → 改造前通过 `/trips/new` 生成的行程如果已保存，坐标已被 Zod strip。这些行程在地图上只能显示目的地标记，无法显示路线折线。缓解：新生成的行程会正确保存坐标；用户可重新生成旧行程。
- **页面高度溢出** → 双栏布局使用 `h-screen`，行程内容多时左侧面板独立滚动 (`overflow-y-auto`)，和 `/trips/new` 同样处理，无额外风险。
