## MODIFIED Requirements

### Requirement: LLM 一次性生成全部天数的行程

系统 SHALL 在收到行程配置后，先调用 DeepSeek（通过 `generateText` + `responseFormat: json_object`）一次性生成所有天数的完整行程，模型不调用任何工具，仅依赖其自身知识。

#### Scenario: 3 天行程一次生成成功

- **WHEN** 用户提交 3 天上海行程配置
- **THEN** 系统调用 DeepSeek 一次，传入目的地、日期范围、人数、预算、行程模式
- **AND** 输出包含 3 个 day 对象的数组，每个 day 含 date、theme 和 activities 列表
- **AND** 每个 activity 包含 time、title、description、location、type 字段
- **AND** 每个 activity 可选包含 highlights、tags（3 个字符串数组）、recommendation 字段
- **AND** 跨天不出现重复的 activity title

#### Scenario: 7 天长行程生成

- **WHEN** 用户提交 7 天行程
- **THEN** 系统仍用单次调用生成全部 7 天
- **AND** 输出结构与其他天数一致

#### Scenario: LLM 调用失败

- **WHEN** DeepSeek 调用因网络错误或 API 超时失败
- **THEN** 系统重试一次
- **AND** 若仍失败，向前端推送 error event 并终止流程

#### Scenario: 活动缺少元数据字段不报错

- **WHEN** LLM 返回的某个 activity 不包含 highlights、tags 或 recommendation 字段
- **THEN** zod schema 解析正常完成（字段为 optional）
- **AND** 该 activity 的其他字段正常填充
