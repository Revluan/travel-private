## 1. API Route

- [x] 1.1 新建 `app/api/amap/place-detail/route.ts`：接收 `keyword` 和 `city` 参数，串联高德 v3 text search → v3 detail，返回统一结构

## 2. PlaceDetailDialog Component

- [x] 2.1 新建 `components/trip/place-detail-dialog.tsx`：Dialog 组件，接收 `activity`、`city`、`open`、`onClose` props
- [x] 2.2 实现 Dialog 内容区：照片横向滚动区、名称+地址、评分+人均 chip、营业时间、电话、标签
- [x] 2.3 实现加载态（骨架屏）和空数据态（"暂无详情数据"）
- [x] 2.4 实现错误态（"加载失败" + 重试按钮）

## 3. AgentStepCard Integration

- [x] 3.1 在 `AgentStepCard` Props 中新增 `city?: string`
- [x] 3.2 在 `day-generated` 活动行中增加"详情"按钮（仅当 `lng` 和 `lat` 存在时显示），管理 Dialog open 状态

## 4. Page Wiring

- [x] 4.1 在 `app/trips/new/page.tsx` 中传递 `city` prop 给 AgentStepCard（从 trip config 中提取城市名）
- [x] 4.2 在 `app/trips/[id]/page.tsx` 中传递 `city` prop 给 AgentStepCard（从 trip config 中提取城市名）
- [x] 4.3 在 `components/trip/agent-progress.tsx` 中透传 `city` prop 给 AgentStepCard
