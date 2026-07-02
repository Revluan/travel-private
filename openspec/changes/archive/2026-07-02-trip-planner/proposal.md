## Why

行程规划是旅行产品的核心功能。用户需要在一个页面中完成目的地选择、参数配置、AI 辅助生成日程，并能对生成结果进行编辑和管理。目前项目只有落地页和基础设施，缺少核心业务能力。

## What Changes

- 新增行程配置页面（`/trips/new`）：表单配置 + Google Maps 地图联动
- 新增日程详情页面（`/trips/[id]`）：AI 生成后的日程展示与编辑，支持按天增删活动
- 新增我的行程列表页面（`/trips`）：已保存行程的 CRUD 管理
- 新增 `/api/trips/*` 系列 API 路由，对接 DeepSeek 生成结构化行程数据
- 新增 Drizzle schema：`trips` 表和 `trip_days` 表

## Capabilities

### New Capabilities

- `trip-planner`: 行程规划全流程 — 配置目的地/日期/预算/模式，AI 生成日程，日程编辑，行程列表管理

### Modified Capabilities

（无现有 spec 需要修改）

## Impact

- **数据库**: 新增 `trips`、`trip_days` 两张表
- **API**: 新增 5 个路由（generate、list、detail、update、delete）
- **前端**: 新增 3 个页面，复用已有 navbar 组件
- **依赖**: 新增 Google Maps JavaScript API（Places Autocomplete + Map）
- **AI 层**: 使用已有 `lib/ai` 的 DeepSeek 封装，新增行程规划专用的 zod schema 和 prompt
