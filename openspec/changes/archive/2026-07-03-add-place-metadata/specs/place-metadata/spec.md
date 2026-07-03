## ADDED Requirements

### Requirement: LLM 为每个活动生成地点元数据

系统 SHALL 在 LLM 生成行程时，为每个 activity 额外输出 `highlights`（地点特点描述）、`tags`（3 个关键词标签）和 `recommendation`（≤20 字推荐语）三个可选字段。

#### Scenario: 正常生成包含元数据的活动

- **WHEN** LLM 生成一个 activity（如"外滩"）
- **THEN** 输出的 JSON 包含 `highlights` 字段，值为 1-2 句地点特点描述
- **AND** 包含 `tags` 字段，值为 3 个关键词的字符串数组
- **AND** 包含 `recommendation` 字段，值为不超过 20 字的一句推荐语

#### Scenario: LLM 未输出元数据字段

- **WHEN** LLM 生成的 activity JSON 中缺少 `highlights`、`tags` 或 `recommendation` 字段
- **THEN** zod schema 解析不报错（字段均为 optional）
- **AND** 前端不渲染缺失字段对应的 UI 元素

### Requirement: 前端展示地点元数据

系统 SHALL 在行程预览页和详情页的 `AgentStepCard` 组件中展示每个活动的 `tags`（标签组）和 `recommendation`（推荐语）。

#### Scenario: 活动包含完整元数据

- **WHEN** 一个 activity 包含 `tags: ["地标", "夜景", "历史"]` 和 `recommendation: "必打卡的魔都夜景圣地"`
- **THEN** 前端渲染三个标签 badge，样式为紧凑的小圆角标签
- **AND** 前端渲染推荐语，以引号图标+文字形式展示
- **AND** `highlights` 展示在 `description` 下方作为补充说明

#### Scenario: 活动不含元数据（旧数据）

- **WHEN** 一个 activity 不包含 `tags` 和 `recommendation` 字段
- **THEN** 前端不渲染标签行和推荐语行
- **AND** 其余内容（标题、时间、地点、描述、交通）正常展示

#### Scenario: 推荐语超过 20 字

- **WHEN** recommendation 内容超过 20 个字符
- **THEN** 前端展示时截断至 20 字并附加省略号
