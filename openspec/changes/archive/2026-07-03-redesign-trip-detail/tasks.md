## 1. API: 补上坐标字段

- [x] 1.1 POST `/api/trips` schema 的 activities object 增加 `lng`、`lat`、`transportTo` 可选字段
- [x] 1.2 PUT `/api/trips/[id]` schema 的 activities object 增加 `lng`、`lat`、`transportTo` 可选字段

## 2. 详情页双栏布局

- [x] 2.1 将 `/trips/[id]/page.tsx` 从单栏 `max-w-2xl` 布局改为 `flex h-screen pt-16` 双栏布局
- [x] 2.2 左侧面板（`w-[560px] shrink-0 overflow-y-auto border-r border-zinc-800 p-6`）展示行程内容
- [x] 2.3 右侧面板（`flex-1 p-4`）嵌入动态导入的 `TripMap`（`ssr: false`）

## 3. 行程内容展示

- [x] 3.1 左侧面板顶部放 "← 我的行程" 返回链接（Link to `/trips`）
- [x] 3.2 概览区域用 emerald 风格卡片（复用 `/trips/new` preview 的样式）展示目的地名、天数、概述
- [x] 3.3 Day tabs 按钮组（复用 `/trips/new` 的 Day tabs 交互）：点击切换当天路线到地图，再次点击取消
- [x] 3.4 用 `AgentStepCard` 替代 `DayCard` 展示每天行程，`onActivityClick` 触发地图高亮（复用现有高亮逻辑）

## 4. 地图交互

- [x] 4.1 `TripMap` 接收目的地经纬度（从 `config.destination` 获取）
- [x] 4.2 Day tab 点击时将当天有坐标的活动拼成 `routePoints` 传给 `TripMap`
- [x] 4.3 活动点击时设置 `highlightPoint`，再次点击取消
- [x] 4.4 移除所有编辑相关状态和逻辑（`saving`、`setOverview`、`updateDay`、`addDay`、`handleSave` 等）

## 5. 验证

- [x] 5.1 TypeScript 编译零错误
- [x] 5.2 页面结构：双栏布局，左侧 560px 行程 + 右侧地图，返回链接
- [x] 5.3 点击 Day tab 逻辑正确（routePoints 构建、toggle 取消）
- [x] 5.4 点击活动高亮逻辑正确（highlightPoint toggle，routePoints 清空）
- [x] 5.5 sessionStorage 无残留引用，无需清理
