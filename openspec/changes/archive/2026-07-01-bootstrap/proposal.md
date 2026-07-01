## Why

`travel-private` 目前没有任何代码——`openspec/project.md` 还停在 "pre-discovery"。后续每一个功能 change（行程规划、AI 生成、行程编辑等）都会反复纠结同一组基础设施问题：用什么 Auth、DB 怎么连、AI 怎么调、目录结构长啥样。

`bootstrap` 一次性把这些地基决策固化下来。它的"功能"就是"项目能跑起来、登录跑通、DB 连上、AI 能调用"，让后续 change 直接长在稳定的地基上，不再为基础设施分心。

## What Changes

- 初始化 Next.js 14+ (App Router) + TypeScript + Tailwind 项目骨架
- 接入 **Clerk** 作为第三方登录注册（开箱即用，自带 UI 组件）
- 接入 **Neon Postgres** + **Drizzle ORM**（含迁移工具 `drizzle-kit`）
- 接入 **Vercel AI SDK** + `@ai-sdk/openai`（OpenAI-compatible 模式），默认 provider 为 **DeepSeek**（`deepseek-chat`）
- 配置 **shadcn/ui** 组件库
- 用 **zod** 作为前后端共享的 schema 层（含 AI structured output 的 schema）
- 约定项目目录结构、环境变量、本地开发与 Vercel 部署流程
- 提供一条公开首页（官网，无需登录）和一个受保护的 `/app` 占位页（需登录才能访问）
- 提供一个最小 AI smoke test（调用 DeepSeek 返回结构化对象，证明链路通）

**Non-goals（明确不做）：**
- 不做任何行程规划业务功能（行程 CRUD、AI 行程生成、地图等）——这些是后续 `add-trip-*` changes 的活
- 不做用户资料、订阅、计费、团队协作
- 不做完整的官网设计（首页只放最简版"项目名 + 登录入口"）

## Capabilities

### New Capabilities

- `foundation`: 项目骨架与基础设施——Next.js 初始化、目录结构、环境变量、本地开发与部署流程的验收契约
- `auth`: 第三方登录注册能力——通过 Clerk 实现的注册、登录、登出、会话保持与受保护路由访问控制
- `data-layer`: 数据访问层——Neon Postgres 连接、Drizzle ORM 配置、迁移机制、本地与生产数据库的连接管理
- `ai-layer`: AI 调用能力——Vercel AI SDK 配置、DeepSeek provider 适配、结构化输出（zod schema）的最小验证

### Modified Capabilities

（无——这是项目的第一个 change，`openspec/specs/` 还没有任何 spec）

## Impact

- **代码**：从零初始化整个仓库（`package.json`、`app/`、`lib/`、`db/`、`.env.example`、`drizzle.config.ts`、`middleware.ts` 等）
- **外部服务**：需要账号与 API key 的服务——Clerk（Auth）、Neon（Postgres）、DeepSeek（AI 模型）
- **部署**：Vercel 项目，需配置环境变量（`DATABASE_URL`、`CLERK_SECRET_KEY`、`CLERK_PUBLISHABLE_KEY`、`DEEPSEEK_API_KEY`）
- **依赖**：`next`、`react`、`@clerk/nextjs`、`drizzle-orm`、`drizzle-kit`、`@neondatabase/serverless`、`ai`、`@ai-sdk/openai`、`zod`、tailwindcss、shadcn 相关
- **后续 changes**：所有后续 change 都假设 `bootstrap` 已完成——目录结构、Auth、DB、AI 链路均已就绪
