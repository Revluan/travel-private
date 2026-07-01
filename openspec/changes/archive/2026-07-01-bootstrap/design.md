## Context

`travel-private` 是一个私人旅行规划项目。第一个 change `bootstrap` 必须把后续所有功能 change 共用的基础设施立起来：Next.js 项目骨架、登录、数据库、AI 调用链路。

当前状态：空仓库，无 `package.json`，无任何代码。`openspec/` 已初始化但 `specs/` 为空。

约束：
- 私人项目，单人开发，无外部用户
- 部署在 Vercel，国内访问稳定性需留意但暂不阻塞
- 已定栈：Next.js (App Router) + Clerk + Drizzle/Neon + Vercel AI SDK + DeepSeek + zod + shadcn/Tailwind
- 不用 zustand（客户端状态用 URL params + Server Components 优先）

## Goals / Non-Goals

**Goals:**
- 立起可跑的 Next.js 项目，本地 `pnpm dev` 起得来，`pnpm build` 通过
- Clerk 登录注册跑通：首页公开，`/app` 受保护
- Drizzle + Neon 连通：能跑迁移、能查询
- Vercel AI SDK + DeepSeek 链路打通：能调用 `generateObject` 返回 typed 对象
- shadcn/ui + Tailwind 配好，至少一个组件可用
- 项目结构、环境变量、部署流程文档化（README + `.env.example`）
- 留出清晰的扩展点：业务功能 change 直接往 `app/` 和 `lib/` 加东西，不再动地基

**Non-Goals:**
- 不做行程规划业务（无 Trip/Stop 数据模型、无行程 UI、无 AI 生成行程逻辑）
- 不做官网设计（首页只放最简版占位）
- 不做用户资料扩展、计费、团队
- 不做 CI/CD pipeline（Vercel 自动部署够用，CI 留给后续 change）
- 不做测试框架搭建（首个功能 change 再决定 vitest/playwright）
- 不做 zustand（明确排除）

## Decisions

### D1. 包管理器：pnpm

**选 pnpm（通过 corepack 启用，版本 11.9.0）。** 理由：磁盘高效、Vercel 原生支持、monorepo 友好（虽然现在不是 monorepo，但预留）。备选 npm（更普世但慢）。`pnpm-lock.yaml` 提交进 git。

**pnpm 11 build scripts 配置**：pnpm 11 默认拒绝执行依赖的 build script（如 `sharp`、`esbuild`）。仓库根需加 `pnpm-workspace.yaml`：
```yaml
onlyBuiltDependencies:
  - sharp
  - esbuild
```
否则 `pnpm install` 会报 `ERR_PNPM_IGNORED_BUILDS`，且 `drizzle-kit` 等依赖会因 lockfile 校验失败而无法运行后续命令。

### D2. 框架：Next.js 16 + React 19（App Router）

**用 Next.js 16 + React 19，App Router + RSC 默认。** 理由：
- 最新稳定版，长期支持周期最长，避免短期内再升级
- React 19 Server Actions 稳定，表单提交省去手写 API 路由
- RSC 默认减少客户端 JS，符合"无 zustand，URL + Server state 优先"原则
- Vercel 亲生部署，新版本支持最及时
- `'use client'` 按需添加（Clerk 组件、shadcn 交互组件等）

**兼容性需在 tasks 阶段验证**：Clerk、shadcn/ui、Drizzle 对 Next 16 + React 19 的支持状态。遇阻塞性问题再决定回退版本（备选 Next 15 + React 19）。

### D3. Auth：Clerk（开箱即用）

**选 Clerk。** 理由：
- 自带 `<SignIn />` `<SignUp />` `<UserButton />` 组件，UI 零成本
- `middleware.ts` 一行 `clerkMiddleware()` 完成路由保护
- 与 Next.js App Router 集成成熟
- 私人项目不在乎 vendor lock-in，免费额度（10K MAU）远超所需

**Clerk 用户与 DB 用户的对应**：Clerk 管认证，DB 不存密码。后续业务 change 如需 user 表，用 `clerkId`（Clerk 的 `userId`）做外键关联——但 `bootstrap` 不建 user 表，留给首个业务 change 决定。

### D4. 数据库：Neon Postgres + Drizzle ORM

**Neon**：托管 Postgres，serverless driver 适配 Vercel Edge/Serverless。免费额度足够私人项目。

**Drizzle**：选 Drizzle 而非 Prisma 的理由：
- TS 优先，schema 即类型，和 zod 互转顺手
- SQL-like API，无重抽象
- `drizzle-kit` 迁移工具透明可控
- 体积小，Edge runtime 无坑

**连接方式**：用 `@neondatabase/serverless` 的 `neon()` HTTP driver（而非 Pool）。理由：Vercel Serverless 函数无长连接，HTTP driver 更稳。

**迁移流程**：
```
本地: pnpm db:generate  →  生成 SQL 迁移文件
      pnpm db:migrate    →  应用到 Neon（开发分支）
      pnpm db:push        →  schema 直接 push（仅开发用）
生产: Vercel 部署时跑 pnpm db:migrate（或手动触发）
```

**目录约定**：
```
db/
├── schema/          # Drizzle schema 定义（按业务域分文件）
│   └── index.ts     # 汇总导出
├── migrations/      # drizzle-kit 生成的 SQL（提交进 git）
├── client.ts        # 单一 db client 实例
└── migrate.ts       # 迁移脚本
```

`bootstrap` 阶段 `schema/` 为空（只放一个空 `index.ts`），首个业务 change 加第一张表。

### D5. AI：Vercel AI SDK + DeepSeek（OpenAI-compatible）

**Vercel AI SDK**（`ai` 包，v7）：统一 API 抽象。AI SDK 7 把 `generateObject` 标记为 deprecated，推荐 `generateText` + `Output.object`。但 DeepSeek 不支持 `response_format: { type: 'json_schema' }`（AI SDK 7 的 `Output.object` 默认走这条），所以**实际用 `generateText` 返回纯文本 + 手动 `JSON.parse` + `zod.parse`**。

**Provider：DeepSeek**（默认 `deepseek-chat`）。接入方式：用 `@ai-sdk/openai` 的 `createOpenAI({ baseURL, apiKey, name })` 包装——DeepSeek 是 OpenAI-compatible API。

```ts
// lib/ai/deepseek.ts
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "../env";

export const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: env.DEEPSEEK_API_KEY,
  name: "deepseek",
});

// 关键：必须用 .chat(modelId) 显式选 chat completions 模型。
// 默认 deepseek(modelId) 返回 responses API 模型，DeepSeek 不支持 /responses 端点（404）。
export const defaultModel = deepseek.chat("deepseek-chat");
```

**封装**：`lib/ai/index.ts` 统一导出 `defaultModel`、`generateText`、`streamText`、`Output`、`generateObject`（兼容旧 API）。后续业务 change 调用 `lib/ai` 而非直接调 SDK。

**DeepSeek 已知限制**（实施时踩到，记此防再踩）：
1. `/responses` 端点 404 → 必须用 `.chat(modelId)`
2. `response_format: json_object` 要求 prompt 含 "JSON" 字样，否则 400
3. `response_format: json_schema` 不支持（AI SDK 7 `Output.object` 默认走这个）→ 改用纯文本 + 手动 parse

**备选 provider**：DeepSeek 故障时可一行切 GLM（同样 OpenAI-compatible）。`design.md` 留备注，不预实现。

### D6. zod：单一 schema 来源

zod 同时承担：表单校验（Client + Server Action）、API 响应校验、AI structured output schema。一份 schema 多处用，避免漂移。

**目录**：`lib/schemas/` 集中放共享 zod schema。`bootstrap` 阶段只有一个 smoke test schema（如 `greetingSchema`）证明链路通。

### D7. shadcn/ui + Tailwind

**Tailwind CSS**（v4 或当前稳定版）+ **shadcn/ui**（CLI 按需加组件，非 npm 依赖）。

`bootstrap` 阶段只装一个 `<Button />` 证明链路通，其余组件后续业务 change 按需 `pnpm dlx shadcn@latest add <component>`。

### D8. 项目目录结构

```
travel-private/
├── app/
│   ├── layout.tsx          # 根 layout, 装 ClerkProvider + Tailwind
│   ├── page.tsx            # 公开首页 (官网占位)
│   ├── (clerk)/            # Clerk 路由组
│   │   ├── sign-in/[[...rest]]/page.tsx
│   │   └── sign-up/[[...rest]]/page.tsx
│   └── app/                # 受保护区
│       ├── layout.tsx      # 检查登录, 装用户菜单
│       └── page.tsx        # /app 占位 (登录后入口)
├── lib/
│   ├── ai/                 # AI SDK + provider 封装
│   ├── db/                 # Drizzle client (re-export from db/)
│   ├── schemas/            # zod schemas (共享)
│   └── utils.ts            # cn() 等
├── db/                     # Drizzle schema + migrations (见 D4)
├── middleware.ts           # clerkMiddleware
├── drizzle.config.ts
├── .env.example
├── .env.local              # 本地, gitignore
└── package.json
```

**关键原则**：
- `app/` 只放路由和组件，业务逻辑在 `lib/`
- `db/` 与 `lib/db/` 分开：`db/` 是 schema 定义和迁移，`lib/db/` 是 client 入口
- `(clerk)` 路由组把登录页隔离，不污染 URL

### D9. 环境变量

`.env.example`（提交进 git）：
```bash
# Database (Neon)
DATABASE_URL=postgres://...@neon.tech/...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app

# AI (DeepSeek)
DEEPSEEK_API_KEY=sk-...
```

`lib/env.ts`：用 zod 校验 `process.env`，启动时 fail-fast 缺失变量。所有代码从 `lib/env.ts` 取 env，不直接读 `process.env`。

### D10. 部署：Vercel

- GitHub repo 连 Vercel，push 自动部署
- Vercel 项目环境变量按 D9 配置
- Neon 在 Vercel 集成市场直接连，自动注入 `DATABASE_URL`
- 部署钩子跑 `pnpm db:migrate`（或手动）

**国内访问提醒**：`*.vercel.app` 国内访问偶发不稳。私人项目暂不处理；后续如需稳定访问，绑自定义域名 + Cloudflare CDN。`design.md` 留备忘，不阻塞 bootstrap。

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Clerk 免费额度 10K MAU，未来若开放注册可能超 | 私人项目短期不会超；超了再升级或迁 Auth.js |
| DeepSeek API 偶发不稳/限速 | `lib/ai` 封装层留切换点，可一行换 GLM |
| Neon 免费档计算时间有限 | 私人项目量级足够；监控用量 |
| Vercel 国内访问不稳 | 短期接受，长期绑域名 + CDN |
| Drizzle schema 为空时 `db:generate` 报错 | bootstrap 验收只要求 `db:migrate` 能跑（无迁移文件时跳过），不要求生成迁移 |
| Clerk + Drizzle 用户关联未定 | 留给首个业务 change；bootstrap 不建 user 表 |
| Next.js 16 + React 19 兼容性 | Clerk / shadcn / Drizzle 对新版本支持状态需在 tasks 阶段验证；遇阻塞回退 Next 15 + React 19 |

## Migration Plan

`bootstrap` 是从零初始化，无迁移。部署流程：

1. 本地：复制 `.env.example` → `.env.local`，填入真实 key
2. 本地：`pnpm install` → `pnpm db:push`（初始化 Neon schema，即便为空也建库）→ `pnpm dev`
3. Vercel：连 GitHub repo，配置环境变量，部署
4. Vercel：Neon 集成（自动注入 `DATABASE_URL`）
5. 生产首次部署后手动跑一次 `pnpm db:migrate`（确认链路）

**Rollback**：bootstrap 失败即整个仓库回到空状态，git revert 即可。无数据迁移风险。

## Open Questions

1. **Next.js 16 + React 19 兼容性**：**已验证通过（2026-06-30）。** 在临时目录跑 `pnpm create next-app@latest` 装到 Next 16.2.9 + React 19.2.4 + Tailwind 4.3.1；`@clerk/nextjs` 7.5.9、`drizzle-orm` 0.45.2 + `drizzle-kit` 0.31.10、`@neondatabase/serverless` 1.1.0、`ai` 7.0.4 + `@ai-sdk/openai` 4.0.2、`zod` 4.4.3 全部安装无 peer dep 警告，`drizzle-kit generate`（空 schema）退出码 0。**结论：保持 Next 16 + React 19，不回退。**
   - **副作用**：pnpm 11 默认拒绝跑 `sharp`/`esbuild` 的 build script，需要在仓库根加 `pnpm-workspace.yaml` 配 `onlyBuiltDependencies`（见 D1 补充）。
   - shadcn/ui 对 Tailwind v4 + Next 16 的实际兼容性在 Group 8 阶段验证。
2. **Tailwind v4 vs v3**：用最新稳定版。shadcn 当前对 v4 的支持状态需在 tasks 阶段确认——若不兼容，回退 v3。
3. **Clerk 用户 → DB user 表的关联时机**：留给首个业务 change 决定。bootstrap 只保证 Clerk 能拿到 `userId`，不预先建表。
4. **测试框架**：bootstrap 不引入。首个业务 change 决定 vitest（unit）+ playwright（e2e）还是只跑 typecheck。
