## Context

项目已有 Next.js + Drizzle + Neon Postgres + Vercel AI SDK (DeepSeek) 基础。需要在此之上构建行程规划功能。交互流程在 explore 阶段已确认：配置页 → AI 生成 → 日程详情编辑 → 保存回列表。

## Goals / Non-Goals

**Goals:**
- 提供三页面行程规划流程：配置、详情编辑、列表管理
- 配置页左右两栏布局（表单 + Google Map 联动）
- AI 生成后自动入库（status = `generated`），用户编辑保存后更新（status = `saved`）
- 日程编辑采用整体覆盖策略（删旧插新）

**Non-Goals:**
- 不实现多目的地行程
- 不实现行程分享/协作
- 不实现地图上的路线规划/导航
- 不实现行程导出（PDF/图片）

## Decisions

### 1. 页面布局：左右两栏

表单在左（固定宽度 ~420px），地图在右（flex-1 填满剩余）。这是旅行类产品的常见形态，表单和地图始终可见，视觉平衡好。

```
┌────────────────────┬──────────────────────────────┐
│   Form Panel       │   Google Map                 │
│   (w-[420px])      │   (flex-1, sticky top-16)    │
│                    │                              │
│   日期范围          │   ┌────────────────────────┐ │
│   目的地            │   │                        │ │
│   预算/人数         │   │    Google Maps         │ │
│   行程模式          │   │    (跟随目的地联动)     │ │
│                    │   │                        │ │
│   [AI 规划行程]     │   └────────────────────────┘ │
└────────────────────┴──────────────────────────────┘
```

备选方案：单列全宽（表单在上，地图在下）。放弃原因：表单字段不多，全宽浪费空间，且滚动时表单和地图互斥不可同时看。

### 2. Activities 存储：JSON column，不拆表

`TripDay.activities` 存为 JSON column，不需要单独的 `activities` 表。

理由：
- 一期不需要按活动维度查询（"所有包含博物馆的行程"）
- 读写都是整体操作（取一天的 activities 或存一天的 activities）
- 避免 N+1 查询和复杂的排序维护
- 删除一个 day 时级联删除 activities，无孤儿数据

### 3. 编辑保存：整体覆盖

PUT `/api/trips/[id]` 接收完整的 `TripDay[]`，后端删掉该 trip 的已有 days 后批量 insert。

理由：
- 前端 data = 后端 data，避免排序号不一致
- 实现简单，无差分逻辑
- 行程数据量小（每 trip 最多几十条 activity），批量 insert 性能无影响

### 4. 天数：从日期范围自动计算

`days = endDate - startDate`，不提供手动覆盖。简单直接，无歧义。

### 5. AI 生成触发：前端 POST → API → DeepSeek → 入库 → 返回

```
前端 POST /api/trips/generate { config }
  → 拼 prompt（config 转中文描述 + 模式偏好指令）
  → generateObject(zodSchema, prompt)
  → INSERT trip + INSERT trip_days
  → 返回 { trip, days[] }
  → 前端 router.push(`/trips/${trip.id}`)
```

API key 在后端，前端不直接调 DeepSeek。

## Data Model

### TypeScript Types

```typescript
// ─── 行程模式 ───
type TripMode = "commando" | "relaxed" | "vacation" | "foodie" | "cultural";

// ─── 活动类型 ───
type ActivityType = "meal" | "attraction" | "transport" | "rest" | "shopping" | "other";

// ─── 用户填写的配置 ───
interface TripConfig {
  startDate: string;          // "2026-07-10"
  endDate: string;            // "2026-07-12"
  destination: {
    placeId: string;
    name: string;
    formattedAddress: string;
    lat: number;
    lng: number;
  };
  budget?: number;
  days: number;               // 自动计算
  peopleCount: number;
  mode: TripMode;
}

// ─── AI 输出的活动 ───
interface PlannedActivity {
  time: string;               // "08:00"
  title: string;
  description: string;
  location: string;
  type: ActivityType;
}

// ─── AI 输出的单天行程 ───
interface GeneratedDay {
  dayNumber: number;
  date: string;               // "2026-07-10"
  theme: string;
  activities: PlannedActivity[];
}

// ─── AI 完整输出 ───
interface GeneratedItinerary {
  overview: string;
  days: GeneratedDay[];
}

// ─── 持久化的 Trip ───
type TripStatus = "generated" | "saved";

interface Trip {
  id: string;
  userId: string;
  title: string;
  config: TripConfig;         // json column
  overview: string;           // 总概述，可编辑
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── 持久化的 TripDay ───
interface TripDay {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  theme: string;
  activities: PlannedActivity[]; // json column
}
```

### Drizzle Schema

```sql
-- trips
id          TEXT PK (uuid)
user_id     TEXT NOT NULL
title       TEXT NOT NULL
config      JSONB NOT NULL
overview    TEXT NOT NULL DEFAULT ''
status      TEXT NOT NULL DEFAULT 'generated'
created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()

-- trip_days
id          TEXT PK (uuid)
trip_id     TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE
day_number  INTEGER NOT NULL
date        TEXT NOT NULL
theme       TEXT NOT NULL DEFAULT ''
activities  JSONB NOT NULL DEFAULT '[]'
```

## API Routes

| Method | Path | 说明 |
|--------|------|------|
| POST | `/api/trips/generate` | 接收 TripConfig，调 DeepSeek，入库，返回 Trip + TripDay[] |
| GET | `/api/trips` | 当前用户的行程列表（按 updated_at 倒序） |
| GET | `/api/trips/[id]` | 单个行程详情（含所有 TripDay） |
| PUT | `/api/trips/[id]` | 更新 trip overview + 整体覆盖 days |
| DELETE | `/api/trips/[id]` | 删除行程（级联删除 days） |

### generate 的 DeepSeek Prompt 结构

```
系统指令：你是专业旅行规划师。根据用户参数生成每日行程...
用户参数：
  - 目的地：{name}, {formattedAddress}
  - 日期：{startDate} ~ {endDate}（共 {days} 天）
  - 人数：{peopleCount} 人
  - 模式：{mode 对应的中文描述}
  - 预算：{budget 或 "不限"}

要求：
  - 每天 3-6 个活动
  - 活动时间合理（考虑交通和用餐）
  - 按 {mode} 调整节奏
```

返回用 `generateObject` + zod schema 确保类型安全。

## Component Tree

```
app/trips/
├── page.tsx                  # 行程列表（/trips）
├── new/
│   └── page.tsx              # 新建行程（/trips/new）
├── [id]/
│   └── page.tsx              # 行程详情编辑（/trips/[id]）

components/trip/
├── trip-form.tsx             # 配置表单（日期、目的地、预算、人数、模式）
├── trip-map.tsx              # Google Maps 封装（显示 pin，接收 lat/lng）
├── trip-overview.tsx         # 总览卡片（显示 + 编辑 overview）
├── day-card.tsx              # 单天行程卡片（折叠/展开）
├── activity-row.tsx          # 单条活动行内编辑
├── activity-type-select.tsx  # 活动类型下拉
└── trip-list-item.tsx        # 列表页的行程卡片
```

## Risks / Trade-offs

- **Google Maps API key 管理**: 需要 `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 暴露在前端。风险可控，Places API 可通过域名限制和用量配额控制。
- **DeepSeek 生成质量不稳定**: prompt engineering 是关键。已在 prompt 结构中加入模式偏好指令和约束（每天 3-6 活动）。如结果不理想，可在 zod schema 中加入更细粒度的格式约束。
- **整体覆盖保存有竞态风险**: 两个 tab 同时编辑同行程后保存，后保存的覆盖先保存的。一期可以接受（单人使用），后续可加 version 字段或乐观锁。
