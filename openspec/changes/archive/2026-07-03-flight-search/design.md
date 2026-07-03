## Context

项目已有 Next.js + Clerk + Neon Postgres + Drizzle + Vercel AI SDK 栈，本次新增机票搜索功能。航班价格数据通过 Amadeus Self-Service API（免费层 2000 次/月）获取。搜索结果缓存到 Postgres，TTL 4 小时以控制 API 调用量。

## Goals / Non-Goals

**Goals:**
- 省域机票搜索：输入出发城市 + 目标省份，返回省内每个机场的最低直达航班和价格
- 甩尾航班发现：自动扫描经停目标城市的联程航班，对比直飞价格，标记节省金额
- API 调用量控制在 Amadeus 免费额度的 10-20% 以内（约 200-400 次/月）

**Non-Goals:**
- 不支持往返搜索（只做单程）
- 不支持多乘客 / 舱位筛选
- 不支持支付、预订跳转——纯搜索对比工具
- 不做实时价格刷新，依赖缓存 + 用户主动重新搜索
- 甩尾航班只是参考展示，不做自动下单

## Decisions

### D1: 使用 Amadeus HTTP API 直接调用，不引入 SDK

**选型**: 直接用 `fetch` 调用 Amadeus REST API + 手动 OAuth token 管理，不走 `@amadeus/amadeus-node`。

**理由**: Amadeus API 只需要两个最关键 endpoint —— Flight Offers Search（直飞搜索）和 Flight Inspiration Search（省域探索）。调用逻辑 ~50 行，SDK 只多了类型定义和 token 自动续期，引入依赖不划算。token 过期自动续的逻辑用简单的 in-memory 缓存 + 过期检查即可。

### D2: Provider 抽象层遵循现有 `lib/ai/` 模式

**选型**: `lib/flights/providers/types.ts` 定义 `FlightProvider` interface，`lib/flights/index.ts` 导出具体实例。切换数据源只需替换 provider 实现。

**理由**: 项目已有 `ai-layer` spec 确立了 provider 封装模式（"切换不波及业务代码"），保持一致。

### D3: 甩尾航班搜索是 Feature 1 的增量步骤，不独立成页

**选型**: 用户搜索"上海→湖南"后，先展示直飞结果（每个城市最低价），然后前端对每条结果触发 `/api/flights/skiplag` 异步扫描，甩尾结果追加到对应城市卡片中。

**理由**: Feature 1 秒级返回（有缓存时 0 调用，无缓存时并行查询约 3-5s），Feature 2 可递进展示不需要阻塞首次渲染。

### D4: 省份→机场数据用静态 JSON，不存数据库

**选型**: `lib/flights/data/airports.json` 存储全国省份→城市→机场映射，构建时直接 import，无需运行时查询。

**理由**: 中国民用机场约 240 个，数据 ≈30KB，每年增量个位数。存数据库是过度设计。高德 API 用于行政区划验证但不在此 feature 内（dest picker 已实现在 trip-planner 中）。

### D5: 缓存策略——DB 表 + UNIX 时间戳 TTL

**选型**: `flight_search_cache` 表，联合唯一键 `(origin_code, dest_code, departure_date)`，`expires_at` 列存过期时间。读取时 check `expires_at > NOW()`，无效则不返回。

**理由**: 不需要 Redis。Postgres 单表 + 时间戳足够简单。4 小时 TTL 平衡数据新鲜度和 API 调用量。

### D6: 甩尾航班的"延程城市"候选列表用启发式规则

**选型**: 从目标机场（如长沙 CSX）出发，取前 10 个国内高频航线作为延程候选（CSX→KMG, CSX→CTU, CSX→CKG…）。这些数据也是静态的（航司航线网络变化慢）。

**理由**: 不可能穷举所有延程城市（组合爆炸），10 个候选 × 8 个机场 = 80 次调用已逼近单次搜索上限。启发式限定合理范围。

## Risks / Trade-offs

- **[风险] Amadeus 中国国内廉航覆盖不全** → 结果缺少春秋、吉祥等航司。给前端加提示"数据来自 Amadeus，可能不包含廉航"。
- **[风险] 甩尾航班法律风险** → 甩尾结果卡片加醒目免责文案："甩尾航班违反航司运输条款，托运行李将到达终点站，请自行评估风险"。
- **[风险] 缓存过期后首次搜索调用量大** → 全未命中时一次省域搜索 ~48 次 API 调用（8 机场直飞 + 8×5 延程）。通过前端 loading 状态和渐进展示缓解体感，偶尔超量问题不大。
- **[风险] Amadeus 免费额度未来可能缩紧** → provider 抽象使切换数据源成本低，预留降级到静态时刻表的能力。

## Open Questions

- Amadeus 中国国内航线覆盖的具体精度？需实测验证
- 甩尾航班候选城市的 TOP 10 列表精度？需根据实际航线数据迭代
