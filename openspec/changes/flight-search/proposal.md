## Why

现有购票App只能按城市搜索机票，无法按省份一键查看所有目的地的最低票价，也不支持发现甩尾航班（经停目标城市的联程票比直飞更便宜）。做一个学习项目，实现这两种搜索模式。

## What Changes

- 新增 **省域机票搜索**：输入出发城市 + 目标省份，返回省内每个机场的最低票价和航班列表
- 新增 **甩尾航班发现**：自动扫描经停目标城市的联程航班，对比直飞价格，标记节省金额
- 新增 `/app/flights` 搜索页面和 `/api/flights/search`、`/api/flights/skiplag` API
- 新增省份→机场静态映射数据
- 新增 Amadeus API 封装（`lib/flights/`），遵循现有 provider 抽象模式
- 新增航班搜索结果数据库缓存（TTL 4小时），控制 API 调用量

## Capabilities

### New Capabilities

- `flight-search`: 省域机票搜索 + 甩尾航班发现，含 API、缓存、页面渲染
- `province-airport-data`: 中国省份→机场映射静态数据

### Modified Capabilities

（无）

## Impact

- 新增依赖：`@amadeus/amadeus-node`（或直接 HTTP 调用 Amadeus API）
- 新增环境变量：`AMADEUS_API_KEY`、`AMADEUS_API_SECRET`
- 新增路由：`/app/flights`、`/api/flights/search`、`/api/flights/skiplag`
- 新增 schema：`db/schema/flight-cache.ts`（搜索结果缓存表）
- 新增 lib：`lib/flights/`（provider 抽象 + Amadeus 实现 + 静态数据）
- 导航栏 "机票搜索" 链接已存在，需指向 `/app/flights`
