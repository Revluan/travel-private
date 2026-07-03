# Plan-first-then-enrich spec

## Purpose

行程生成流程从"先搜地点再规划"改为"LLM 先规划全量行程 → 高德 POI 关键词搜索获取坐标 → 高德路径规划计算交通"，让 DeepSeek 的旅行知识主导规划、高德 API 提供地理数据补充。

## ADDED Requirements

### Requirement: LLM 一次性生成全部天数的行程

系统 SHALL 在收到行程配置后，先调用 DeepSeek（通过 `generateObject` + zod schema）一次性生成所有天数的完整行程，模型不调用任何工具，仅依赖其自身知识。

#### Scenario: 3 天行程一次生成成功

- **WHEN** 用户提交 3 天上海行程配置
- **THEN** 系统调用 DeepSeek 一次，传入目的地、日期范围、人数、预算、行程模式
- **AND** 输出包含 3 个 day 对象的数组，每个 day 含 date、theme 和 activities 列表
- **AND** 每个 activity 包含 time、title、description、location、type 字段
- **AND** 跨天不出现重复的 activity title

#### Scenario: 7 天长行程生成

- **WHEN** 用户提交 7 天行程
- **THEN** 系统仍用单次调用生成全部 7 天
- **AND** 输出结构与其他天数一致

#### Scenario: LLM 调用失败

- **WHEN** DeepSeek 调用因网络错误或 API 超时失败
- **THEN** 系统重试一次
- **AND** 若仍失败，向前端推送 error event 并终止流程

### Requirement: 对每个活动调用高德 POI 关键词搜索获取坐标

系统 SHALL 在 LLM 生成行程后，对每个 activity 以 `title` 为关键词调用高德 POI 文本搜索 API，取返回第一条结果的坐标填入 activity。

#### Scenario: 关键词搜索成功

- **WHEN** activity title 为"外滩"且高德返回匹配结果
- **THEN** 该 activity 的 lng/lat 填入高德返回的坐标
- **AND** 前端收到 geocode-result event 显示搜索成功

#### Scenario: 关键词搜索无结果

- **WHEN** activity title 在高德中搜不到匹配结果
- **THEN** 系统尝试去掉末尾后缀词（"店""餐厅""公园"等）重新搜索
- **AND** 若仍无结果，lng/lat 留空
- **AND** 该 activity 仍保留在行程中（仅地图上不显示）

#### Scenario: 并行搜索多个地点

- **WHEN** 行程有 M 个 activity 需要坐标
- **THEN** 系统并行发起 M 个高德搜索请求（不串行等待）
- **AND** 所有搜索完成后进入下一阶段

### Requirement: 对相邻活动计算交通

系统 SHALL 在坐标获取完成后，对每天内相邻的 activity 对调用高德路径规划 API，并填入 transportTo。

#### Scenario: 计算驾车路线

- **WHEN** 两个相邻 activity 都有有效坐标
- **THEN** 系统调用高德驾车路径规划 API
- **AND** transportTo 填入 mode、duration、distance

#### Scenario: 某活动无坐标时跳过交通计算

- **WHEN** 相邻的两个 activity 中至少一个 lng/lat 为空
- **THEN** 跳过该对的交通计算
- **AND** transportTo 不填入

### Requirement: 前端展示三阶段进度

系统 SHALL 通过 SSE 向前端推送 planning、geocoding、routing 三个阶段的进度事件。

#### Scenario: 展示阶段切换

- **WHEN** agent 从 planning 阶段切换到 geocoding 阶段
- **THEN** 前端推送 phase event，phase 字段从 "planning" 变为 "geocoding"
- **AND** AgentProgress 组件更新顶部状态指示器

#### Scenario: 展示 geocode 和 route 事件

- **WHEN** geocoding 阶段每个地点搜索完成
- **THEN** 前端渲染一张小型结果卡片，显示地点名和坐标获取状态
- **WHEN** routing 阶段每条路线计算完成
- **THEN** 前端渲染一张结果卡片，显示起终点和交通方式/耗时

### Requirement: 修复解析失败导致展示"自由活动"

系统 SHALL 使用 AI SDK 的 `generateObject` + zod schema 替代自由文本 + 正则提取，确保行程数据不因 JSON 格式问题丢失。

#### Scenario: 正常输出被正确解析

- **WHEN** DeepSeek 返回符合 schema 的结构化数据
- **THEN** `generateObject` 直接返回类型安全的 `GeneratedItinerary`
- **AND** 不需要 extractJSON/normalizeDay 等手动解析

#### Scenario: 输出格式异常时降级处理

- **WHEN** DeepSeek 返回的数据无法匹配 schema 且重试耗尽
- **THEN** 系统尝试用原有的正则提取 + 活动恢复逻辑作为最终 fallback
- **AND** 若 fallback 也失败，返回明确错误而非静默显示"自由活动"
