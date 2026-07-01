## ADDED Requirements

### Requirement: 项目可通过 pnpm 启动本地开发服务器

系统 SHALL 在执行 `pnpm install` 后通过 `pnpm dev` 启动 Next.js 本地开发服务器，并在浏览器访问 `http://localhost:3000` 时返回 HTTP 200。

#### Scenario: 全新克隆后启动开发服务器
- **WHEN** 开发者在干净仓库执行 `pnpm install` 然后 `pnpm dev`
- **THEN** Next.js 开发服务器在 `http://localhost:3000` 启动
- **AND** `curl http://localhost:3000` 返回状态码 200

#### Scenario: 生产构建通过
- **WHEN** 开发者执行 `pnpm build`
- **THEN** 构建成功退出，退出码为 0
- **AND** `.next/` 目录生成生产构建产物

### Requirement: 项目 SHALL 提供公开首页

系统 SHALL 在根路径 `/` 提供一个无需登录即可访问的公开页面，作为项目官网占位。

#### Scenario: 未登录用户访问首页
- **WHEN** 未登录用户访问 `/`
- **THEN** 页面返回 200 并渲染项目名称与登录入口链接
- **AND** 不触发任何重定向到登录页

### Requirement: 环境变量缺失时启动失败且错误清晰

系统 SHALL 在启动时通过 zod 校验所有必需的环境变量，缺失或格式错误时立即终止进程并打印缺失变量名。

#### Scenario: 缺失数据库连接字符串
- **WHEN** `DATABASE_URL` 未设置或为空字符串时执行 `pnpm dev` 或 `pnpm build`
- **THEN** 进程退出码非 0
- **AND** 错误日志包含缺失的变量名 `DATABASE_URL`

#### Scenario: 缺失 Clerk 密钥
- **WHEN** `CLERK_SECRET_KEY` 或 `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` 未设置
- **THEN** 进程退出码非 0
- **AND** 错误日志包含缺失的变量名

#### Scenario: 缺失 DeepSeek API key
- **WHEN** `DEEPSEEK_API_KEY` 未设置
- **THEN** 进程退出码非 0
- **AND** 错误日志包含缺失的变量名 `DEEPSEEK_API_KEY`

### Requirement: 项目目录结构遵循约定

系统 SHALL 采用 `design.md` D8 节定义的目录结构：`app/`（路由与组件）、`lib/`（业务逻辑）、`db/`（Drizzle schema 与迁移）、`middleware.ts`（Clerk 中间件）、`drizzle.config.ts`、`.env.example`。

#### Scenario: 新增业务功能时位置可预测
- **WHEN** 后续 change 需要新增 API 路由、共享 schema 或数据库表定义
- **THEN** 路由文件放置在 `app/` 下
- **AND** zod schema 放置在 `lib/schemas/`
- **AND** Drizzle 表定义放置在 `db/schema/`

### Requirement: 项目提供 `.env.example` 模板

系统 SHALL 在仓库根目录提交 `.env.example`，包含所有必需环境变量的占位符与说明注释，且不含任何真实密钥。

#### Scenario: 新开发者复制环境模板
- **WHEN** 开发者执行 `cp .env.example .env.local`
- **THEN** `.env.local` 包含所有必需变量名
- **AND** 每个变量有占位符值，不包含真实密钥
- **AND** `.env.local` 被 `.gitignore` 忽略

### Requirement: TypeScript 类型检查通过

系统 SHALL 通过 `pnpm typecheck`（或等价命令）执行 TypeScript 类型检查，退出码为 0。

#### Scenario: 类型检查无错误
- **WHEN** 在仓库根目录执行类型检查命令
- **THEN** 命令退出码为 0
- **AND** 无类型错误输出
