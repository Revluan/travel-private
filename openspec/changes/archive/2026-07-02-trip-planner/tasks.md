## 1. Data Layer

- [x] 1.1 创建 Drizzle schema：在 `db/schema/trip.ts` 定义 trips 和 tripDays 表，在 `db/schema/index.ts` 导出
- [x] 1.2 运行 `pnpm db:generate` 生成迁移文件
- [x] 1.3 运行 `pnpm db:migrate` 应用到开发数据库

## 2. AI Layer

- [x] 2.1 在 `lib/ai/schemas.ts` 定义 `GeneratedItinerary`、`GeneratedDay`、`PlannedActivity` 的 zod schema
- [x] 2.2 在 `lib/ai/prompts.ts` 实现 `buildTripPrompt(config: TripConfig)` 拼装中文 prompt
- [x] 2.3 在 `lib/ai/generate-trip.ts` 实现 `generateTrip(config)` 调用 `generateObject` 并返回类型安全结果

## 3. API Routes

- [x] 3.1 创建 `app/api/trips/generate/route.ts`：接收 config、调用 `generateTrip`、入库、返回 trip + days
- [x] 3.2 创建 `app/api/trips/route.ts`：GET 当前用户行程列表
- [x] 3.3 创建 `app/api/trips/[id]/route.ts`：GET 详情、PUT 更新（整体覆盖 days）、DELETE 删除

## 4. Shared Types

- [x] 4.1 在 `lib/types/trip.ts` 定义 `TripConfig`、`TripMode`、`ActivityType` 等共享类型

## 5. Frontend Components

- [x] 5.1 实现 `trip-form.tsx`：配置表单（日期范围、目的地 Places Autocomplete、预算、人数、模式下拉）
- [x] 5.2 实现 `trip-map.tsx`：Google Maps 封装组件，接收 lat/lng，显示 pin
- [x] 5.3 实现 `trip-overview.tsx`：总览卡片，可编辑 overview 文本
- [x] 5.4 实现 `activity-row.tsx`：单条活动的行内编辑表单
- [x] 5.5 实现 `day-card.tsx`：单天行程折叠卡片，包含活动列表和添加按钮
- [x] 5.6 实现 `trip-list-item.tsx`：列表页行程卡片（标题、日期、模式、操作按钮）

## 6. Pages

- [x] 6.1 创建 `/trips/new` 页面（左右两栏：trip-form + trip-map）
- [x] 6.2 创建 `/trips/[id]` 页面（总览 + 按天排列的 day-card，保存按钮）
- [x] 6.3 创建 `/trips` 列表页面（行程卡片列表 + 新建按钮）

## 7. Wiring

- [x] 7.1 Navbar 中 "行程规划" 链接指向 `/trips`
- [x] 7.2 AI 生成成功后 router.push 到详情页
- [x] 7.3 保存成功后 router.push 到列表页
