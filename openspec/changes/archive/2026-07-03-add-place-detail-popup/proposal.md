## Why

当前行程中的每个地点只展示 AI 生成的文字描述（description、highlights、recommendation），缺少真实的营业信息、评分、人均消费、照片等结构化数据。用户在做出行决策时需要这些信息。高德 v3 POI 详情接口提供了这些字段，接入成本低，效果立竿见影。

## What Changes

- 在行程活动卡片（AgentStepCard）中为每个地点增加"详情"按钮
- 点击后弹出 Dialog，展示从高德 API 获取的真实地点详情
- 新增 `/api/amap/place-detail` API route，代理高德 v3 detail 接口
- 新增 `PlaceDetailDialog` 组件，包含照片、评分、人均消费、营业时间、电话、标签等信息
- AgentStepCard 新增 `city` prop，用于高德搜索定位

## Capabilities

### New Capabilities

- `place-detail-popup`: 地点详情弹窗，通过高德 API 获取并展示 POI 的结构化详情（评分、人均、照片、营业时间、电话、标签）

### Modified Capabilities

<!-- No existing spec requirements are changing -->

## Impact

| 层面 | 影响 |
|------|------|
| 组件 | 新增 `PlaceDetailDialog`，修改 `AgentStepCard` |
| API | 新增 `GET /api/amap/place-detail?keyword=&city=` |
| 依赖 | 使用已有的高德 Web API Key（`NEXT_PUBLIC_AMAP_WEB_KEY`） |
| 页面 | `/trips/new` 和 `/trips/[id]` 自动生效（共享 AgentStepCard） |
