# Trip Planner delta spec

## MODIFIED Requirements

### REQ-004: AI 生成行程并自动入库

系统 SHALL 提供两种 AI 生成路径（agent 和原有非 agent），用户通过 `/trips/new` 页面发起：

**Agent 路径** (`POST /api/trips/generate/agent`)：LLM 先规划全量行程 → 高德 POI 关键词搜索获取坐标 → 高德路径规划计算交通，流式返回进度，用户确认后保存入库。

**非 Agent 路径** (`POST /api/trips/generate`)：单次 DeepSeek 调用生成结构化行程，自动入库后跳转详情页。行为保持不变。

#### Scenario: Agent 路径生成成功

- **WHEN** 用户填写完整配置并点击 "AI Agent 规划"
- **THEN** 系统 POST 到 `/api/trips/generate/agent`，携带 TripConfig
- **AND** 前端通过 SSE 展示三阶段进度（planning → geocoding → routing）
- **AND** 完成后展示行程预览，包含含坐标的真实地点数据
- **AND** 用户可点击"保存"将行程写入数据库，或点击"重新生成"

#### Scenario: 非 Agent 路径生成成功（行为不变）

- **WHEN** 用户选择原有路径并点击 "AI 规划行程"
- **THEN** 系统 POST 到 `/api/trips/generate`，携带 TripConfig
- **AND** 按钮显示加载状态，不可重复点击
- **AND** 后端调用 DeepSeek 返回结构化行程 JSON
- **AND** Trip 和 TripDay 数据写入数据库，status 为 `generated`
- **AND** 前端收到响应后跳转到 `/trips/[id]`

#### Scenario: Agent 路径生成失败

- **WHEN** Agent 路径的 LLM 调用或高德 API 批量查询失败
- **THEN** 系统在页面上显示错误提示和"重试"按钮
- **AND** 不创建数据库记录
- **AND** 用户可重新点击"重试"或返回修改参数

#### Scenario: 必填字段缺失

- **WHEN** 用户未选择目的地或未填写日期范围就点击提交
- **THEN** 系统在缺失字段下方显示校验错误提示
- **AND** 不发起 API 请求
