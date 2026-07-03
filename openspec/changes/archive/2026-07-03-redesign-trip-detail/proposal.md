## Why

当前行程详情页 (`/trips/[id]`) 是单栏编辑器布局，没有地图，用户在查看行程时看不到活动的地理位置。而新建行程页 (`/trips/new`) 的预览阶段已经是左侧行程+右侧地图的双栏展示，体验更好。将详情页改为同样风格的双栏纯展示，用户在查看已保存行程时能在地图上直观看到每日路线。

## What Changes

- 行程详情页从单栏编辑器改为双栏展示（左：行程内容 560px，右：高德地图）
- 所有字段从可编辑变为只读展示，去掉保存按钮
- 左侧面板复用 `AgentStepCard` 展示每日行程，复用概览卡片样式
- 右侧复用 `TripMap`，支持 Day tabs 切换展示当天路线折线
- 点击单个活动在地图上高亮显示（琥珀色星标）
- 保留 "← 我的行程" 返回链接
- API 层：POST 和 PUT 的 Zod schema 补上 `lng`/`lat`/`transportTo` 字段，确保坐标落库

## Capabilities

### Modified Capabilities
- `trip-planner`: REQ-005（日程详情页改为纯展示，不再可编辑）、REQ-006（移除活动增删改功能）、REQ-007（移除编辑保存逻辑）、REQ-009（导航保留返回链接）

## Impact

- `app/trips/[id]/page.tsx` — 主体改造，单栏编辑器 → 双栏展示
- `app/api/trips/route.ts` — POST schema 增加坐标字段
- `app/api/trips/[id]/route.ts` — PUT schema 增加坐标字段
- `components/trip/trip-overview.tsx` — 不再需要（被内联展示卡片替代）
- `components/trip/day-card.tsx` — 不再需要（被 AgentStepCard 替代）
- `components/trip/activity-row.tsx` — 不再需要（编辑功能移除）
- `openspec/specs/trip-planner/spec.md` — 更新 REQ-005 到 REQ-007、REQ-009
