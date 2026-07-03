# Agent Trip Planner spec

## Purpose

使用 ReAct Agent 替代原有的单次 LLM 调用生成行程，Agent 可调用景点搜索、餐厅搜索、酒店搜索和交通查询工具获取真实数据，前端逐步展示每一步的工具调用和推理过程。

## Requirements

### REQ-001: Agent 可调用景点搜索工具

Agent SHALL 能调用 `search_attractions` 工具搜索指定城市的景点信息。

#### Scenario: Agent 搜索上海景点

- **WHEN** Agent 在处理上海行程规划时决定搜索景点
- **THEN** 系统调用高德 POI 搜索 API，keywords="景点"，city="上海"
- **AND** 返回结果包含景点名称、地址、经纬度和评分
- **AND** 前端展示 "搜索景点" tool call 卡片及其结果数量

#### Scenario: Agent 按关键词精确搜索

- **WHEN** Agent 传入 keyword="博物馆" 搜索
- **THEN** 系统将 keyword 拼入高德 POI 搜索请求
- **AND** 返回结果仅包含博物馆类景点

### REQ-002: Agent 可调用餐厅搜索工具

Agent SHALL 能调用 `search_restaurants` 工具搜索指定城市的餐厅信息。

#### Scenario: Agent 搜索当地美食

- **WHEN** Agent 在处理行程时决定搜索餐厅
- **THEN** 系统调用高德 POI 搜索 API，types="餐饮"，city=目的地城市
- **AND** 返回结果包含餐厅名称、地址、经纬度、评分和人均价格
- **AND** 前端展示 "搜索餐厅" tool call 卡片及其结果数量

### REQ-003: Agent 可调用酒店搜索工具

Agent SHALL 能调用 `search_hotels` 工具搜索指定城市的酒店信息。

#### Scenario: Agent 搜索住宿

- **WHEN** Agent 决定查询目的地住宿选项
- **THEN** 系统调用高德 POI 搜索 API，types="酒店"，city=目的地城市
- **AND** 返回结果包含酒店名称、地址、经纬度、评分和价格区间

### REQ-004: Agent 可调用交通查询工具

Agent SHALL 能调用 `get_transport` 工具查询两个地点之间的交通方式和耗时。

#### Scenario: Agent 查询两点间驾车距离

- **WHEN** Agent 传入两个地点的经纬度和 mode="driving"
- **THEN** 系统调用高德驾车路径规划 API
- **AND** 返回距离（米）、预计耗时（秒）和路线步骤

#### Scenario: Agent 查询公交/地铁方案

- **WHEN** Agent 传入 mode="transit" 查询两点间公共交通
- **THEN** 系统调用高德公交路径规划 API
- **AND** 返回公交/地铁线路、换乘信息和预计耗时

#### Scenario: Agent 查询步行距离

- **WHEN** Agent 传入 mode="walking" 查询步行距离
- **THEN** 系统返回步行距离和耗时

### REQ-005: Agent 多步推理生成行程

Agent SHALL 在最多 15 步内完成行程规划，每步可包含思考、工具调用或两者。

#### Scenario: Agent 完成一次完整的行程规划

- **WHEN** 用户提交行程配置并触发 Agent 规划
- **THEN** Agent 按照 ReAct 循环执行：思考 → 调用工具 → 观察结果 → 思考 → ...
- **AND** 系统限制最多 15 个 step
- **AND** 最后一步输出符合 `GeneratedItinerary` 格式的完整 JSON
- **AND** 行程中的活动引用工具返回的真实数据（名称、地址等）

#### Scenario: Agent 达到最大步数限制

- **WHEN** Agent 在第 15 步仍未输出完整行程
- **THEN** 系统强制终止 Agent 循环
- **AND** 前端显示超时错误提示

### REQ-006: Agent 遵循行程模式

Agent SHALL 根据用户选择的行程模式（特种兵/休闲/度假/美食/文化）调整规划策略。

#### Scenario: 美食模式优先搜餐厅

- **WHEN** 用户选择 "美食之旅" 模式
- **THEN** Agent 优先调用 `search_restaurants` 并获取详细餐饮数据
- **AND** 生成的行程以美食为主线，餐厅安排在核心时段

#### Scenario: 特种兵模式紧凑排程

- **WHEN** 用户选择 "特种兵打卡" 模式
- **THEN** Agent 安排每天 5-8 个活动，使用 `get_transport` 验证相邻地点交通可行性

### REQ-007: 前端流式展示 Agent 步骤

前端 SHALL 在用户提交行程配置后，通过 SSE 流式接收 Agent 每一步的状态并渲染为卡片。

#### Scenario: 展示 tool call 卡片及其结果

- **WHEN** Agent 执行一个工具调用
- **THEN** 前端渲染一张 tool call 卡片，显示工具名称（如 "搜索景点"）、参数摘要
- **AND** 卡片初始状态为 loading（旋转动画）
- **WHEN** 工具返回结果后
- **THEN** 同一张卡片更新为完成状态，显示结果摘要（如 "找到 20 个景点"）
- **AND** 加载动画替换为完成图标

#### Scenario: 展示思考步骤

- **WHEN** Agent 在调用工具前后输出思考文本
- **THEN** 前端渲染一张思考卡片，显示 AI 的推理文本（使用与其他卡片不同的视觉样式）

#### Scenario: 生成完成后展示行程预览

- **WHEN** Agent 完成所有步骤并输出最终行程 JSON
- **THEN** 前端显示完整行程预览（概览文字 + 按天的活动列表）
- **AND** 用户可点击 "保存行程" 将结果写入数据库
- **AND** 用户可点击 "重新生成" 重新启动 Agent

#### Scenario: 生成过程中用户可取消

- **WHEN** Agent 正在执行步骤
- **THEN** 前端显示 "取消" 按钮
- **WHEN** 用户点击取消
- **THEN** SSE 连接中断，Agent 在后端终止
- **AND** 前端恢复到表单状态，用户可修改参数重新提交

### REQ-008: 保存行程到数据库

系统 SHALL 在用户确认后，将 Agent 生成的行程写入数据库。

#### Scenario: 用户保存生成的行程

- **WHEN** 用户在行程预览页点击 "保存行程"
- **THEN** 系统调用 PUT `/api/trips/[id]` 写入 Trip 和 TripDay 数据
- **AND** Trip status 设为 `saved`
- **AND** 保存成功后跳转到 `/trips/[id]`

### REQ-009: 工具数据源为高德 API

所有搜索和交通工具 SHALL 使用高德 Web API 作为数据源。

#### Scenario: 高德 API 调用失败

- **WHEN** 高德 API 返回非成功状态码或网络错误
- **THEN** 工具返回错误信息给 Agent（不抛异常终止循环）
- **AND** Agent 根据错误信息决定重试或跳过该工具
- **AND** 前端 tool call 卡片显示错误状态

### REQ-010: 保留原有非 Agent 接口

原有 `POST /api/trips/generate` SHALL 保持不变，作为 fallback。

#### Scenario: 原有接口仍可正常使用

- **WHEN** 调用 POST `/api/trips/generate` 并传递有效 config
- **THEN** 行为与改造前完全一致（单次 DeepSeek 调用 + 直接入库 + 跳转）

## History

- 2026-07-03 — initial spec (from agent-trip-planner change)
