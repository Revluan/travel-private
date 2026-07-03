## Context

当前 `AgentStepCard` 组件在 `day-generated` 模式下渲染每个 `PlannedActivity`，展示 AI 生成的文字信息（description、highlights、recommendation）。用户希望在此基础上增加一个"详情"按钮，点击后弹窗展示从高德 API 获取的真实结构化数据。

`AgentStepCard` 在 `/trips/new`（规划预览）和 `/trips/[id]`（行程详情）两个页面共用，改动该组件即可同时覆盖两处。

## Goals / Non-Goals

**Goals:**
- 在 `AgentStepCard` 的每个活动行右侧增加"详情"按钮
- 点击按钮弹出 Dialog，展示从高德 v3 API 获取的 POI 详情
- 展示：照片、评分、人均消费、营业时间、电话、特色标签
- 覆盖加载态、空数据态、错误态
- 不影响现有活动行的布局和交互

**Non-Goals:**
- 不在 `PlannedActivity` 中持久化 POI ID（每次实时搜索）
- 不修改 AI 生成流程（不增加 schema 字段）
- 不做地点之间的对比功能
- 不缓存高德 API 响应

## Decisions

### 1. Dialog 置于 AgentStepCard 内部

**选择：** `PlaceDetailDialog` 由 `AgentStepCard` 内部管理 open/close 状态。

**理由：** AgentStepCard 在两处页面共用，放在内部零改动即可覆盖两个页面。唯一代价是 AgentStepCard 需要新增一个 `city` prop（用于高德搜索），两处页面已有该数据。

**替代方案考虑：** 将 Dialog 放在 page 层级并通过 callback 传递——需要改动 `AgentProgress`、两个 page 文件，增加 3+ 处传递链，收益为零。

### 2. API Route 代理高德 API

**选择：** 在 `/api/amap/place-detail` Route Handler 中串联高德 text search + detail 两次调用。

**理由：** 前端只传 `keyword + city`，不需要 POI ID。服务端串行两次高德调用避免了前端暴露 key 和跨域问题。

**替代方案考虑：** 前端直接调高德 → 暴露 key；前端分两次调 → 多一次网络往返。

### 3. 搜索策略：text search → detail

**选择：** 先用 `/v3/place/text` 按 keyword+city 搜索，取第一个结果的 ID，再用 `/v3/place/detail` 获取详情。

**理由：** `PlannedActivity` 中没有 POI ID，只有 title + location。此方式复用已有的搜索能力。

**风险：** 搜索匹配可能不精确（如同名地点）。缓解：搜索时限定城市范围，利用高德的排序算法（通常第一个结果最相关）。

### 4. 复用 v3 接口而非 v5

**选择：** 使用高德 v3 detail 接口而非 v5。

**理由：** v3 返回字段更多（biz_ext.level 景区等级、website、alias、featured_reviews、indoor_data），项目已有的搜索也用的 v3，保持一致。

### 5. 不引入额外 UI 依赖

**选择：** 复用项目已有的 `@/components/ui/dialog`（基于 Base UI）、Tailwind CSS。

**理由：** 零新增依赖。Dialog 样式与项目已有 popover 风格一致（rounded-xl、bg-popover、backdrop-blur）。

## Risks / Trade-offs

- **[搜索精度] 同名地点可能匹配错误** → 搜索时传入城市名作为限定，必要时可传入坐标辅助定位
- **[API 限流] 高德 Web API 有 QPS 限制** → 当前用户量级下不是问题，未来可加前端 debounce
- **[响应时间] 每次点击都需要 2 次高德 HTTP 调用（~300-800ms）** → Dialog 展示 loading 骨架屏，体验可接受

## Open Questions

<!-- None at this time -->
