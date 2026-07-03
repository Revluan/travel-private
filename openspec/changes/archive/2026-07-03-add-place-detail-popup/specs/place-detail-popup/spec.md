## ADDED Requirements

### Requirement: 用户可查看地点详情弹窗

系统 SHALL 在行程活动列表中为每个有坐标的地点提供"详情"按钮，点击后弹出 Dialog 展示该地点在高德地图中的结构化信息。

#### Scenario: 用户点击详情按钮

- **WHEN** 用户在行程预览页或详情页点击某个活动行右侧的"详情"按钮
- **THEN** 系统弹出 Dialog，展示加载状态（骨架屏）
- **AND** 系统通过 `/api/amap/place-detail?keyword=<title>&city=<city>` 获取地点详情
- **AND** 加载完成后展示：照片（横向滚动）、名称、地址、评分、人均消费、营业时间、电话、特色标签

#### Scenario: 高德 API 返回空结果

- **WHEN** 高德搜索未匹配到该地点的 POI
- **THEN** Dialog 展示"暂无详情数据"
- **AND** 仍展示活动本身已有的文字信息（title、location、description）

#### Scenario: 网络请求失败

- **WHEN** `/api/amap/place-detail` 请求失败（超时、网络错误）
- **THEN** Dialog 展示"加载失败，请稍后重试"及重试按钮

#### Scenario: 关闭弹窗

- **WHEN** 用户点击 Dialog 的关闭按钮、蒙层区域、或按 ESC 键
- **THEN** Dialog 关闭，恢复页面原有滚动状态

### Requirement: 地点详情 API Route

系统 SHALL 提供 `GET /api/amap/place-detail` 接口，接受 `keyword` 和 `city` 参数，串联调用高德 v3 搜索和详情接口后返回统一的详情数据结构。

#### Scenario: 正常搜索并返回详情

- **WHEN** 请求 `/api/amap/place-detail?keyword=故宫博物院&city=北京`
- **THEN** 系统先调用高德 `/v3/place/text` 按关键词和城市搜索
- **AND** 取第一个结果的 POI ID，调用高德 `/v3/place/detail` 获取详情
- **AND** 返回 JSON：`{ name, address, location, tel, rating, cost, openTime, photos: [{title, url}], tags: string[], bizType, website, businessArea }`

#### Scenario: 搜索无结果

- **WHEN** 高德 text search 未找到匹配的 POI
- **THEN** 返回 `{ notFound: true }`，HTTP 200

#### Scenario: 高德 API 错误

- **WHEN** 高德 API 返回非 1 的 status 或请求超时
- **THEN** 返回 `{ error: "<错误描述>" }`，HTTP 502

### Requirement: 详情按钮仅在有坐标的地点显示

系统 SHALL 仅对包含 `lng` 和 `lat` 字段的活动显示"详情"按钮，因为高德搜索需要坐标辅助定位。

#### Scenario: 有坐标的活动

- **WHEN** 活动的 `lng` 和 `lat` 均不为 null/undefined
- **THEN** 活动行右侧显示"详情"按钮

#### Scenario: 无坐标的活动（纯文本 placeholder）

- **WHEN** 活动缺少 `lng` 或 `lat`
- **THEN** 不显示"详情"按钮
