# Trip Planner spec

## Purpose

提供 AI 辅助的行程规划功能：用户配置目的地和参数，系统通过 DeepSeek 生成结构化日程，用户可编辑并管理行程。

## Requirements

### REQ-001: 行程配置表单收集用户出行参数

系统 SHALL 在 `/trips/new` 页面提供行程配置表单，包含日期范围、目的地、预算、人数和行程模式字段。

#### Scenario: 用户填写完整配置

- **WHEN** 用户在配置表单中填写日期范围、选择目的地、输入预算和人数、选择行程模式
- **THEN** 所有字段值在表单中正确显示
- **AND** "AI 规划行程" 按钮处于可点击状态

#### Scenario: 日期范围自动计算天数

- **WHEN** 用户选择开始日期和结束日期
- **THEN** 天数自动计算为结束日期减去开始日期的差值
- **AND** 天数不可手动修改

#### Scenario: 预算为可选字段

- **WHEN** 用户未填写预算直接提交
- **THEN** 预算视为"不限"，不影响表单提交

#### Scenario: 目的地通过输入联想选择城市

- **WHEN** 用户在目的地输入框输入文字
- **THEN** 系统通过高德行政区划搜索 API 返回城市名称建议列表
- **AND** 用户选择一条建议后，目的地字段填入城市名称和经纬度

### REQ-002: 行程模式涵盖五种出行风格

系统 SHALL 提供五种行程模式选项：特种兵打卡、休闲模式、度假模式、美食之旅、文化探索。

#### Scenario: 用户选择行程模式

- **WHEN** 用户点击行程模式下拉框
- **THEN** 展示五种选项：特种兵打卡、休闲模式、度假模式、美食之旅、文化探索
- **AND** 用户选择一个后，下拉框显示所选模式

### REQ-003: 地图随目的地联动

系统 SHALL 在配置页面右侧嵌入高德地图，当用户选择目的地后，地图中心移动到该位置的经纬度并放置标记。

#### Scenario: 选择目的地后地图联动

- **WHEN** 用户从目的地联想列表中选择一个城市
- **THEN** 地图中心移动到目的地的 (lng, lat)
- **AND** 地图上显示该位置的标记

#### Scenario: 未选择目的地时地图显示默认视图

- **WHEN** 用户进入配置页面且未选择目的地
- **THEN** 地图显示默认区域

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

### REQ-005: 日程详情页展示总览和每日行程

系统 SHALL 在 `/trips/[id]` 页面以左侧行程+右侧地图的双栏布局展示行程，所有内容为只读。

#### Scenario: 用户查看已保存的行程

- **WHEN** 用户访问 `/trips/[id]`
- **THEN** 页面显示为双栏布局：左侧 560px 固定宽度面板展示行程内容，右侧弹性宽度面板展示高德地图
- **AND** 左侧面板顶部显示返回链接 "← 我的行程"
- **AND** 左侧面板显示概览卡片：目的地名称、天数、行程概述文本（只读）
- **AND** 概览卡片下方显示 Day tabs 按钮组，每个按钮标注 "Day N"
- **AND** Day tabs 下方按天展示每日行程卡片，每天包含日期、主题和活动列表
- **AND** 每个活动显示时间、类型图标、标题、地点、描述
- **AND** 当活动包含 highlights 字段时，显示地点特点描述
- **AND** 当活动包含 tags 字段时，以标签 badge 形式展示关键词
- **AND** 当活动包含 recommendation 字段时，以引号样式展示推荐语
- **AND** 所有内容均为只读展示，无可编辑输入框

#### Scenario: 行程数据包含坐标时显示地图路线

- **WHEN** 行程的活动数据包含有效的 `lng` 和 `lat` 坐标
- **THEN** 右侧地图显示目的地标记
- **AND** 用户点击某个 Day tab 后，地图上显示该天的路线折线和编号标记

#### Scenario: 行程数据不含坐标时地图仅显示目的地

- **WHEN** 行程的活动数据不包含坐标（旧数据）
- **THEN** 右侧地图仅显示目的地城市标记
- **AND** Day tabs 点击不触发路线绘制

#### Scenario: 用户点击单个活动

- **WHEN** 用户点击某个活动的行（该活动有坐标）
- **THEN** 地图中心移动到该活动位置
- **AND** 该活动位置显示琥珀色星标高亮标记和名称标签
- **AND** 再次点击同一活动取消高亮

### REQ-008: 行程列表页展示已保存行程

系统 SHALL 在 `/trips` 页面以美拉德色系卡片画廊网格形式展示当前用户的所有行程，每张卡片包含渐变色背景、行程信息标签和悬停动效，按更新时间倒序排列。

#### Scenario: 用户查看行程列表

- **WHEN** 用户访问 `/trips`
- **THEN** 页面以自适应多列卡片网格展示所有行程
- **AND** 每张卡片具有与行程模式对应的美拉德色系渐变背景
- **AND** 每张卡片显示标题、日期范围、目的地、人数、行程模式标签
- **AND** 每张卡片显示天数标签、人数标签、状态标签
- **AND** 卡片按 updated_at 倒序排列
- **AND** 每张卡片提供"查看"、"编辑"、"删除"操作
- **AND** 卡片具有 16px 圆角和悬停上浮动效

#### Scenario: 用户从列表进入已有行程

- **WHEN** 用户点击某行程卡片的"查看"或"编辑"
- **THEN** 系统跳转到 `/trips/[id]`，展示该行程的日程详情

#### Scenario: 用户删除行程

- **WHEN** 用户点击某行程卡片的"删除"按钮，并在确认操作后确认
- **THEN** 系统 DELETE `/api/trips/[id]`
- **AND** 行程及其所有天数从数据库中删除
- **AND** 该行程卡片从网格中移除

#### Scenario: 用户从列表页进入新建行程

- **WHEN** 用户在列表页点击"新建"按钮
- **THEN** 系统跳转到 `/trips/new`

### REQ-009: 日程详情页不可返回配置页

系统 SHALL 确保 `/trips/[id]` 页面提供返回行程列表的导航。

#### Scenario: 用户在日程详情页的导航选项

- **WHEN** 用户在 `/trips/[id]` 页面
- **THEN** 页面左上角提供 "← 我的行程" 返回链接，跳转到 `/trips`
- **AND** 不提供返回 `/trips/new` 或编辑/保存按钮

## History

- 2026-07-02 — initial spec (from trip-planner change)
- 2026-07-02 — REQ-008 updated: card list → card gallery grid with Maillard color scheme (from trips-card-redesign change)
- 2026-07-03 — REQ-005 MODIFIED, REQ-006/REQ-007 REMOVED, REQ-009 MODIFIED: detail page from editor to read-only dual-panel with map (from redesign-trip-detail change)
- 2026-07-03 — REQ-004 MODIFIED: dual AI generation paths (agent SSE + legacy) (from fix-agent-planning-flow change)
