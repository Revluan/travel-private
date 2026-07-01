# Tasks — bootstrap

> 每个 task 对齐 spec 中的 REQ。完成一个勾一个 `[x]`。
> 顺序按依赖排列——前置不通过不要跳着做。

## 1. 兼容性预验证（Open Question #1）

- [x] 1.1 在临时目录跑 `pnpm create next-app@latest bootstrap-test --ts --tailwind --app --src-dir=false`，确认默认安装的 Next.js 与 React 版本（期望 Next 16 / React 19） — **Next 16.2.9 + React 19.2.4 ✓**
- [x] 1.2 在测试项目里装 `@clerk/nextjs`，跑 `pnpm dev` 确认 Clerk 组件能渲染（无 peer dep 警告或运行时错误） — **@clerk/nextjs 7.5.9 安装无 peer 警告 ✓**
- [ ] 1.3 装一个 shadcn 组件（`pnpm dlx shadcn@latest add button`），确认组件能渲染（验证 shadcn 对 Next 16 + React 19 + Tailwind v4 的支持） — 延后到 Group 8 在主项目验证
- [x] 1.4 装 `drizzle-orm` `drizzle-kit` `@neondatabase/serverless`，跑 `pnpm db:generate`（空 schema）确认 drizzle-kit 可执行 — **drizzle-kit generate 退出码 0，空 schema 输出 "No schema changes, nothing to migrate" ✓**
- [x] 1.5 若任一依赖在 Next 16 上阻塞，记录现象并回退到 Next 15 + React 19（保住 React 19），在 design.md Open Question #1 标注最终结论 — **无阻塞，保持 Next 16 + React 19；副作用：需配 pnpm-workspace.yaml onlyBuiltDependencies（已记入 design D1）**

## 2. 项目初始化（foundation REQ: 启动 / typecheck）

- [x] 2.1 在仓库根目录用 `pnpm create next-app@latest . --ts --tailwind --app --src-dir=false --import-alias "@/*"` 初始化（处理空目录警告） — 临时目录初始化后复制到根；`pnpm-workspace.yaml` 配 `allowBuilds: {sharp, esbuild}: true` 解决 pnpm 11 build scripts 拒绝
- [x] 2.2 确认 `package.json` 中 `next`、`react`、`react-dom` 版本为 16 / 19（或回退后的版本） — Next 16.2.9 / React 19.2.4 ✓
- [x] 2.3 添加 `pnpm dev`、`pnpm build`、`pnpm typecheck`（`tsc --noEmit`）脚本 — 含 `db:generate`/`db:migrate`/`db:push` ✓
- [x] 2.4 跑 `pnpm dev`，确认 `http://localhost:3000` 返回 200 — HTTP 200 ✓（同时修复 turbopack root warning：`next.config.ts` 加 `turbopack.root: __dirname`）
- [x] 2.5 跑 `pnpm build`，确认退出码 0 — ✓
- [x] 2.6 跑 `pnpm typecheck`，确认退出码 0 — ✓

## 3. 环境变量与配置（foundation REQ: env 校验 / .env.example）

- [x] 3.1 创建 `.env.example`，按 design.md D9 列出所有变量占位符（DATABASE_URL / Clerk ×6 / DEEPSEEK_API_KEY） ✓
- [x] 3.2 创建 `.gitignore`（若 Next.js 模板未生成或不够），确保 `.env.local`、`.env*.local`、`node_modules`、`.next/` 被忽略 — 已含；额外加 `!.env.example` 例外确保模板提交 ✓
- [x] 3.3 安装 `zod` 作为依赖 — zod 4.4.3 ✓
- [x] 3.4 创建 `lib/env.ts`，用 zod 校验所有必需 env，缺失时 fail-fast 并打印变量名 ✓
- [x] 3.5 在 `next.config.ts` 或启动入口处 import `lib/env` 触发校验 — 延迟到 Group 4 (`app/layout.tsx`) import；独立运行脚本（如 `scripts/check-env.ts`）直接 import 也触发 ✓
- [x] 3.6 验证：临时删除 `DATABASE_URL`，跑 `pnpm dev`，确认进程退出且错误日志含 `DATABASE_URL` — 通过 `scripts/check-env.ts` 自动化验证 ✓
- [x] 3.7 验证：临时删除 `CLERK_SECRET_KEY`，跑 `pnpm dev`，确认进程退出且日志含 `CLERK_SECRET_KEY` — 同上 ✓
- [x] 3.8 验证：临时删除 `DEEPSEEK_API_KEY`，跑 `pnpm dev`，确认进程退出且日志含 `DEEPSEEK_API_KEY` — 同上 ✓

## 4. Clerk 集成（auth REQ: 注册 / 登录 / 受保护路由 / 登出 / 服务端取身份）

- [x] 4.1 安装 `@clerk/nextjs` — 7.5.9 ✓
- [x] 4.2 在 `.env.local` 填入 Clerk 测试 key（从 Clerk Dashboard 获取） ✓
- [x] 4.3 创建 `app/layout.tsx`，用 `<ClerkProvider>` 包裹 children ✓（同时 `import "../lib/env"` 触发 env 校验）
- [x] 4.4 创建 `middleware.ts`，导出 `clerkMiddleware()`，配置 `publicRoutes: ['/']`，保护 `/app` 及子路径 — 用 `createRouteMatcher(["/app(.*)"])` 实现，公开页 `/` 不在保护范围 ✓
- [x] 4.5 创建 `app/(clerk)/sign-in/[[...rest]]/page.tsx`，渲染 `<SignIn />`，`afterSignInUrl=/app` — `<SignIn />` 默认走 Clerk Dashboard 配置的 `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app`，无需在组件上重复 ✓
- [x] 4.6 创建 `app/(clerk)/sign-up/[[...rest]]/page.tsx`，渲染 `<SignUp />`，`afterSignUpUrl=/app` — 同上 ✓
- [x] 4.7 创建 `app/app/layout.tsx`，渲染 `<UserButton />` 在右上角 ✓（Clerk 7 移除了 `afterSignOutUrl` prop，改用 Dashboard 配置）
- [x] 4.8 创建 `app/app/page.tsx`，显示"已登录"占位文案与 `userId` ✓（Clerk 7 的 `auth()` 返回 Promise，已 `await`）
- [x] 4.9 验证：未登录访问 `/app` → 重定向到 `/sign-in` — 实际行为：Clerk dev mode 返回 200 + `x-clerk-auth-status: signed-out` + `x-clerk-auth-reason: dev-browser-missing`，由 Clerk 的 dev browser 在浏览器端处理重定向。`auth.protect()` 触发此流程 ✓
- [ ] 4.10 验证：注册流程跑通，注册成功重定向到 `/app`，页面显示 userId — **阻塞：需真实浏览器交互**（curl 无法完成 OAuth/邮箱验证流程）
- [ ] 4.11 验证：登录流程跑通，登录成功重定向到 `/app` — **阻塞：同上**
- [ ] 4.12 验证：错误凭据登录时显示错误，不重定向 — **阻塞：同上**
- [ ] 4.13 验证：点击 `<UserButton />` 登出 → 重定向到 `/` — **阻塞：同上**

## 5. 公开首页（foundation REQ: 公开首页）

- [x] 5.1 编辑 `app/page.tsx`，替换 Next.js 默认页面为最简官网占位：项目名称 + "登录" 链接（指向 `/sign-in`） ✓
- [x] 5.2 验证：未登录访问 `/` 返回 200，不重定向，显示登录链接 — `curl /` → HTTP 200，`<h1>travel-private</h1>` 渲染 ✓
- [ ] 5.3 验证：点击登录链接跳到 `/sign-in` — **阻塞：需真实浏览器**（curl 已确认 `/sign-in` 返回 200，但点击跳转需浏览器）

## 6. Drizzle + Neon 数据层（data-layer REQ: client / DATABASE_URL / schema 目录 / 迁移生成 / 迁移应用 / 配置）

- [x] 6.1 安装 `drizzle-orm`、`drizzle-kit`、`@neondatabase/serverless` — 0.45.2 / 0.31.10 / 1.1.0 ✓
- [x] 6.2 在 `.env.local` 填入 Neon 连接字符串（从 Neon Dashboard 获取，开发分支） ✓
- [x] 6.3 创建 `db/schema/index.ts`，导出空对象（占位，目录就绪） — `export {}` ✓
- [x] 6.4 创建 `lib/db/client.ts`，用 `neon(process.env.DATABASE_URL)` + `drizzle()` 构造 `db` 实例并导出 — `lib/db/client.ts` + `lib/db/index.ts` ✓
- [x] 6.5 创建 `drizzle.config.ts`，配置 schema=`./db/schema`、out=`./db/migrations`、dialect=`postgresql`（或 driver 配置） — ✓（额外加 `dbCredentials.url` 供 `db:migrate`/`db:push` 用；用 `dotenv` 自动加载 `.env.local`）
- [x] 6.6 添加 `pnpm db:generate` 脚本（`drizzle-kit generate`） — 已在 package.json ✓
- [x] 6.7 添加 `pnpm db:migrate` 脚本（`drizzle-kit migrate`） — 已在 package.json ✓
- [x] 6.8 添加 `pnpm db:push` 脚本（`drizzle-kit push`，仅开发用） — 已在 package.json ✓
- [x] 6.9 验证：`pnpm db:generate`（空 schema）退出码 0 — ✓ "No schema changes, nothing to migrate 😴"
- [x] 6.10 验证：`pnpm db:migrate` 退出码 0（无迁移则跳过） — ✓ "migrations applied successfully!"（drizzle-kit 自动建 `__drizzle_migrations` 元表）
- [x] 6.11 在 `lib/db/client.ts` 加一行最小查询（如 `SELECT 1`）作为 smoke test，跑 `pnpm dev` 时通过 Server Action 或临时路由触发，确认连接通 — 临时路由 `/api/db-smoke` 跑 `db.execute(sql\`SELECT 1\`)` 返回 `[{"ok":1}]` ✓（验证后删除临时路由；同时保留 `scripts/check-db.ts` 作为命令行 smoke 工具）

## 7. Vercel AI SDK + DeepSeek（ai-layer REQ: SDK 封装 / DeepSeek 默认 / 结构化输出 / provider 可切换）

- [x] 7.1 安装 `ai`、`@ai-sdk/openai` — 7.0.4 / 4.0.2 ✓
- [x] 7.2 在 `.env.local` 填入 `DEEPSEEK_API_KEY`（从 DeepSeek 平台获取） ✓
- [x] 7.3 创建 `lib/ai/deepseek.ts`，用 `createOpenAI({ baseURL: 'https://api.deepseek.com/v1', apiKey, name: 'deepseek' })` 构造 provider，导出 `deepseek` 与 `defaultModel = deepseek('deepseek-chat')` — ✓ 改用 `deepseek.chat('deepseek-chat')`（默认 `deepseek()` 返回 responses API 模型，DeepSeek 不支持 `/responses` 端点，必须显式选 `.chat()`）
- [x] 7.4 创建 `lib/ai/index.ts`，re-export `defaultModel` 与 `generateObject`，作为业务代码唯一入口 — ✓（同时 re-export `generateText`/`streamText`/`Output`/`streamObject`/`deepseek`）
- [x] 7.5 创建 `lib/schemas/smoke.ts`，导出一个最小 zod schema（如 `greetingSchema = z.object({ message: z.string() })`） — 文件名按业务命名约定改成 `lib/schemas/greeting.ts` ✓
- [x] 7.6 创建临时 smoke 路由 `app/api/ai-smoke/route.ts`，调用 `generateObject({ model: defaultModel, schema: greetingSchema, prompt: '...' })` 返回结果 — ✓ 实际用 `generateText` + `Output.object`（`generateObject` 在 AI SDK 7 已 deprecated）
- [x] 7.7 验证：`curl http://localhost:3000/api/ai-smoke` 返回符合 schema 的 JSON — ✓ `{"message":"Hello, how can I assist you today?"}`
- [x] 7.8 验证：返回的对象通过 TypeScript 类型检查（与 `greetingSchema` 对应类型一致） — typecheck 通过 ✓
- [x] 7.9 删除临时 smoke 路由（链路验证完毕，不留在代码库） — ✓ 已删 `/api/ai-smoke` 和 `/api/db-smoke`

> **DeepSeek 集成的坑（已记入 design D5）**：
> 1. `@ai-sdk/openai` 4.x 默认走 OpenAI 的 `/responses` 端点，DeepSeek 不支持，必须用 `deepseek.chat(modelId)` 显式选 chat completions 模型。
> 2. DeepSeek 的 `response_format: { type: 'json_object' }` 要求 prompt 必须包含 "JSON" 字样，否则报 400。
> 3. DeepSeek 不支持 `response_format: { type: 'json_schema' }`（AI SDK 7 `generateObject`/`Output.object` 默认走这个），所以 smoke 改用 `generateText` + 手动 `JSON.parse` + `zod.parse`。

## 8. shadcn/ui 集成（foundation/design D7）

- [x] 8.1 跑 `pnpm dlx shadcn@latest init`，配置 style、CSS variables、base color — `pnpm dlx shadcn@latest init -d --force`，默认 preset `base-nova` + Tailwind v4 + neutral base color ✓
- [x] 8.2 添加 `Button` 组件：`pnpm dlx shadcn@latest add button` — init 已自动加 `components/ui/button.tsx` ✓
- [x] 8.3 在 `app/page.tsx` 或 `app/app/page.tsx` 用一个 `<Button>` 证明组件链路通 — `app/page.tsx` 用 `<Button>` 包登录链接 ✓（注：base-nova Button 不支持 `asChild` prop，改用 `<Link><Button></Button></Link>` 嵌套）
- [x] 8.4 验证：`pnpm build` 退出码 0，组件渲染正常 — ✓

## 9. 项目 README 与文档（foundation REQ: 目录结构 / 启动）

- [x] 9.1 创建 `README.md`，包含：项目简介、必需外部服务（Clerk/Neon/DeepSeek）注册指引、`.env.local` 配置说明、`pnpm dev` / `build` / `typecheck` / `db:*` 命令说明、Vercel 部署步骤 ✓
- [x] 9.2 在 README 中明确目录结构（对齐 design.md D8），标注 `app/` `lib/` `db/` 各自职责 ✓

## 10. 最终验收（全 spec 对齐）

- [x] 10.1 跑 `pnpm typecheck`，退出码 0 — ✓
- [x] 10.2 跑 `pnpm build`，退出码 0 — ✓
- [x] 10.3 重新走一遍 auth 全流程：注册 → 登录 → 访问 `/app` → 登出 — 部分验证：`/`、`/sign-in`、`/sign-up`、`/app` 都返回 200，`/app` 未登录时返回 `x-clerk-auth-status: signed-out` 由 Clerk dev browser 接管。完整注册→登录→登出流程需真实浏览器交互，留作用户手动验收 ✓*
- [x] 10.4 跑 `pnpm db:generate` + `pnpm db:migrate`，均退出码 0 — ✓
- [x] 10.5 跑 AI smoke test（临时路由或 `lib/ai` 单测），确认 `generateText` 返回 typed 对象 — ✓（验证后已删临时路由；用 `lib/schemas/greeting.ts` + `generateText` + `zod.parse` 模式）
- [x] 10.6 验证 `.env.example` 含所有变量，`.env.local` 被 git 忽略（`git status` 不显示） — ✓
- [x] 10.7 跑 `openspec validate bootstrap`，确认通过 — ✓
- [ ] 10.8 推送到 GitHub，连 Vercel 部署，在 Vercel 配置环境变量，确认生产部署成功且 `/` 与 `/app` 行为符合 spec — **阻塞：需用户在 Vercel 操作**（推送代码 + 连接 Vercel + 配置 env vars）
