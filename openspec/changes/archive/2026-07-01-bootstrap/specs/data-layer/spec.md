## ADDED Requirements

### Requirement: 应用可通过单一 client 模块访问 Drizzle 实例

系统 SHALL 在 `lib/db/client.ts` 导出唯一的 Drizzle 实例 `db`，使用 `@neondatabase/serverless` 的 HTTP driver 构造，所有数据库访问通过该实例进行。

#### Scenario: 业务代码导入 db 实例
- **WHEN** 任何模块需要访问数据库
- **THEN** 从 `lib/db` 导入 `db`
- **AND** 不直接构造新的 Drizzle 实例或 Neon client

### Requirement: 数据库连接通过 DATABASE_URL 环境变量配置

系统 SHALL 从 `process.env.DATABASE_URL` 读取 Neon Postgres 连接字符串，并通过 `lib/env.ts` 的 zod 校验确保其存在且非空。

#### Scenario: 提供 Neon 连接字符串
- **WHEN** `.env.local` 中 `DATABASE_URL` 指向有效的 Neon 数据库
- **THEN** `db` 实例成功构造
- **AND** 查询请求通过 HTTP driver 到达 Neon

#### Scenario: 连接字符串缺失
- **WHEN** `DATABASE_URL` 未设置
- **THEN** 进程启动时 fail-fast 退出
- **AND** 错误日志指明缺失 `DATABASE_URL`

### Requirement: Drizzle schema 文件集中管理并支持扩展

系统 SHALL 在 `db/schema/` 目录集中放置 Drizzle 表定义，并通过 `db/schema/index.ts` 汇总导出。`bootstrap` 阶段 schema 可为空，但目录结构与导出机制就绪。

#### Scenario: 后续 change 新增表定义
- **WHEN** 后续业务 change 需要新增一张表
- **THEN** 表定义文件放置在 `db/schema/` 下
- **AND** 通过 `db/schema/index.ts` 导出
- **AND** 不需要修改 `lib/db/client.ts`

### Requirement: 项目支持通过 drizzle-kit 生成迁移

系统 SHALL 配置 `drizzle-kit` 与 `drizzle.config.ts`，提供 `pnpm db:generate` 脚本根据 `db/schema/` 生成 SQL 迁移文件到 `db/migrations/`。

#### Scenario: schema 变更后生成迁移
- **WHEN** 开发者修改 `db/schema/` 后执行 `pnpm db:generate`
- **THEN** `db/migrations/` 下生成对应的 SQL 迁移文件
- **AND** 迁移文件名包含时间戳或序号

#### Scenario: schema 为空时不报错
- **WHEN** `db/schema/` 为空但目录结构正确时执行 `pnpm db:generate`
- **THEN** 命令以退出码 0 完成
- **AND** 不生成迁移文件或生成空迁移

### Requirement: 项目支持应用迁移到目标数据库

系统 SHALL 提供 `pnpm db:migrate` 脚本，使用 `drizzle-kit migrate` 或等价机制将 `db/migrations/` 下的迁移应用到 `DATABASE_URL` 指定的数据库。

#### Scenario: 应用迁移到开发数据库
- **WHEN** 开发者执行 `pnpm db:migrate` 且 `DATABASE_URL` 指向 Neon 开发分支
- **THEN** 迁移按顺序应用
- **AND** 命令退出码为 0

#### Scenario: 无迁移文件时跳过
- **WHEN** `db/migrations/` 为空时执行 `pnpm db:migrate`
- **THEN** 命令以退出码 0 完成
- **AND** 数据库无变更

### Requirement: Drizzle 配置文件指向正确路径

系统 SHALL 在仓库根目录提供 `drizzle.config.ts`，配置 schema 路径为 `./db/schema`、迁移输出路径为 `./db/migrations`、driver 为 neon-http。

#### Scenario: drizzle-kit 读取配置
- **WHEN** 执行任意 `drizzle-kit` 命令
- **THEN** 配置从 `drizzle.config.ts` 读取
- **AND** schema 与 migrations 路径解析到 `db/schema` 与 `db/migrations`
