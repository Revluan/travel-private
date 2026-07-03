## Why

当前 agent 的 POI-first 流程是反的——先用高德搜 25 个固定地点，再让 DeepSeek 从池子里挑。这导致多天行程重复、错过知名地点（不在高德 top-10 里就搜不到）、以及解析失败时页面始终显示"自由活动"。需要把流程纠正为"先规划后查地理信息"，让 DeepSeek 主导规划、高德做地理数据补充。

## What Changes

- **反转 agent 流程**：先让 DeepSeek 基于知识生成完整行程（含活动名称、时间、描述），再对每个活动调用高德 POI 关键词搜索获取坐标，最后调路径规划算交通
- **修复展示 bug**：页面始终显示"自由活动"——根因是 JSON 解析链路多处脆弱（extractTextFromResult → extractJSON → normalizeDay → validateCityInDay），其中至少一个环节对正常输出判 null
- **移除 Phase 1 的固定 POI 池收集**：不再预先调用 searchAttractions/searchRestaurants/searchHotels 构建 fixed pool
- **保留 getTransport 工具**：从 planning 阶段改为 enrichment 阶段，在坐标拿到后批量计算
- **改为单次全量规划**：不再每天并行调用 agent，改为一次 DeepSeek 调用生成全部天数（避免天与天之间重复），然后并行做地理 enrichment

## Capabilities

### New Capabilities

- `plan-first-then-enrich`: 行程生成流程改为"LLM 规划 → 高德 POI 关键词查找 → 高德路径规划"三阶段，LLM 输出决定搜索什么，而非搜索结果决定行程

### Modified Capabilities

- `trip-planner`: REQ-004 中 agent 路径的生成方式变更（从 POI-first 改为 plan-first），但不影响原有 `/api/trips/generate` 非 agent 路径

## Impact

- 修改：`lib/agent/index.ts`（主流程重写）、`lib/agent/prompt.ts`（prompt 改为生成全量行程 + 富化）
- 可能简化或移除：`lib/agent/tools/search-attractions.ts`、`search-restaurants.ts`、`search-hotels.ts`（不再需要泛搜，改为关键词精准搜索）
- 修改：`lib/agent/stream-types.ts`（SSE event 可能调整 phase 结构）
- 前端组件可能微调：`components/trip/agent-progress.tsx`（phase 文案调整）
- 不影响：`app/api/trips/generate/agent/route.ts`（接口层不变）
