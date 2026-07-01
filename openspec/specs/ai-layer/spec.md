# AI-layer spec

## Purpose
通过 Vercel AI SDK 统一封装大语言模型调用，默认接入 DeepSeek，支持 zod 结构化输出与 provider 切换不波及业务代码。

## Requirements

### Requirement: 项目通过 Vercel AI SDK 统一调用 AI 模型

系统 SHALL 通过 `ai` 包（Vercel AI SDK）调用大语言模型，所有 AI 调用经 `lib/ai/` 封装模块进入，不直接在业务代码中引用具体 provider。

#### Scenario: 业务代码调用 AI
- **WHEN** 后续业务 change 需要调用大语言模型
- **THEN** 从 `lib/ai` 导入模型实例或封装函数
- **AND** 不在业务代码中直接 `import` provider 适配器

### Requirement: 默认 provider 为 DeepSeek，通过 OpenAI-compatible 接入

系统 SHALL 使用 `@ai-sdk/openai` 的 `createOpenAI` 包装 DeepSeek API，配置 `baseURL` 为 `https://api.deepseek.com/v1`，默认模型为 `deepseek-chat`。

#### Scenario: 调用默认模型
- **WHEN** 业务代码使用 `lib/ai` 导出的默认模型实例
- **THEN** 请求发往 `https://api.deepseek.com/v1`
- **AND** 使用 `deepseek-chat` 模型
- **AND** 请求头携带 `DEEPSEEK_API_KEY`

#### Scenario: DeepSeek key 缺失
- **WHEN** `DEEPSEEK_API_KEY` 未设置时调用 AI
- **THEN** 进程启动时 fail-fast 退出
- **AND** 错误日志指明缺失 `DEEPSEEK_API_KEY`

### Requirement: AI 调用支持 zod 结构化输出

系统 SHALL 通过 Vercel AI SDK 的 `generateObject` 能力，根据 zod schema 让模型返回类型安全的结构化对象。

#### Scenario: smoke test 调用返回结构化对象
- **WHEN** 执行 `bootstrap` 的 AI smoke test，传入一个简单 zod schema 调用 `generateObject`
- **THEN** 返回的对象满足该 zod schema
- **AND** TypeScript 编译器认可返回类型为该 schema 对应的类型

#### Scenario: 模型返回不符合 schema
- **WHEN** 模型返回内容无法解析为符合 schema 的对象
- **THEN** `generateObject` 抛出错误或 SDK 重试
- **AND** 不返回类型不匹配的对象

### Requirement: Provider 切换不波及业务代码

系统 SHALL 将 provider 选择封装在 `lib/ai/` 内，更换 provider（如从 DeepSeek 切到 GLM）只需修改 `lib/ai/` 内部，不需要改动调用方代码。

#### Scenario: 切换到备用 provider
- **WHEN** 未来开发者将 `lib/ai` 内的 provider 从 DeepSeek 改为 GLM
- **THEN** 所有 `lib/ai` 的调用方代码无需修改
- **AND** 调用方仍通过同一导出接口访问模型

## History
- 2026-07-01 — initial spec (from bootstrap change)
