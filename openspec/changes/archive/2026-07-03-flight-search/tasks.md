## 1. 静态数据

- [x] 1.1 创建 `lib/flights/data/airports.json`，包含中国所有省份→城市→机场映射
- [x] 1.2 为每个机场添加 `commonConnections`（高频延程航线列表）
- [x] 1.3 创建 `lib/flights/data/index.ts`，导出城市→机场代码、代码→城市、省份→机场列表的查找工具函数

## 2. Amadeus Provider 封装

- [x] 2.1 添加 `AMADEUS_API_KEY` 和 `AMADEUS_API_SECRET` 到 `lib/env.ts` 的 zod 校验
- [x] 2.2 创建 `lib/flights/providers/types.ts`，定义 `FlightProvider` interface（`searchOffers`、`searchInspiration`）
- [x] 2.3 创建 `lib/flights/providers/amadeus.ts`，实现 Amadeus OAuth token 管理和 REST API 调用
- [x] 2.4 创建 `lib/flights/index.ts`，导出 provider 实例

## 3. 缓存层

- [x] 3.1 创建 `db/schema/flight-cache.ts`，定义 `flightSearchCache` 表（origin_code, dest_code, departure_date, result_json, expires_at）
- [x] 3.2 生成并执行数据库迁移
- [x] 3.3 创建 `lib/flights/cache.ts`，实现 `getCache`/`setCache` 函数

## 4. API 路由

- [x] 4.1 创建 `app/api/flights/search/route.ts`（POST），实现省域搜索：省份→机场列表→并行查询→合并返回
- [x] 4.2 创建 `app/api/flights/skiplag/route.ts`（POST），实现甩尾航班扫描：直飞价→延程候选→并行查联程→过滤→返回
- [x] 4.3 API 路由中使用 `auth()` 保护，集成缓存读写

## 5. 搜索页面

- [x] 5.1 创建 `app/app/flights/page.tsx`，渲染搜索表单（出发地联想输入、省份下拉、日期选择、搜索按钮）
- [x] 5.2 创建搜索结果展示组件，按城市分组显示航班卡片（直飞航班列表）
- [x] 5.3 创建甩尾航班展示组件（嵌入城市卡片底部），展示风险提示
- [x] 5.4 实现甩尾航班开启/关闭筛选开关
- [x] 5.5 实现直飞结果展示后异步请求甩尾航班并递进渲染

## 6. 集成与验证

- [x] 6.1 导航栏"机票搜索"链接指向 `/app/flights`
- [x] 6.2 `pnpm build` 通过，TypeScript 类型检查无错误
- [x] 6.3 搜索关键路径手动测试：选择上海→湖南→搜索→验证直飞结果→验证甩尾结果
