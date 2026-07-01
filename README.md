# travel-private

A private travel study project. Spec-driven development with the Claude Code harness,
OpenSpec workflow, and Superpowers-style composable skills.

## How we work

Every meaningful change goes through the OpenSpec cycle:

1. **Explore** — `/explore` — think without commitment. Read code, weigh options, shape the plan.
2. **Propose** — `/propose <change-name>` — create `openspec/changes/<change-name>/` with proposal, specs, design, tasks.
3. **Apply** — `/apply <change-name>` — implement tasks from the checklist, marking each complete.
4. **Archive** — `/archive <change-name>` — move the change to `openspec/changes/archive/<date>-<change-name>/` and merge specs into `openspec/specs/`.

No code is written before the spec is agreed. No spec is rigid — any artifact can be updated at any time.

## Directory layout

```
travel-private/
├── CLAUDE.md              # harness memory — read this first
├── AGENTS.md              # cross-agent rules (codex, cursor, etc.)
├── .claude/               # Claude Code harness config + slash commands
│   ├── settings.json
│   └── commands/          # /explore /propose /apply /archive /spec /skill
├── openspec/              # OpenSpec spec-driven dev
│   ├── README.md          # workflow guide
│   ├── project.md         # project context
│   ├── conventions.md     # spec writing rules
│   ├── specs/             # stable, source-of-truth specs
│   └── changes/           # active proposals + archive/
├── skills/                # project-scoped Superpowers-style skills
│   └── README.md
└── docs/                  # long-form notes, ADRs, research
```

## Quick start

### Prerequisites

- Node.js 22+ (uses nvm in dev, `v22.17.0` tested)
- pnpm 11+ (enable via corepack: `corepack enable pnpm`)
- Accounts + keys for:
  - **Clerk** — https://dashboard.clerk.com (Auth)
  - **Neon** — https://neon.tech (Postgres)
  - **DeepSeek** — https://platform.deepseek.com (AI model)

### Setup

```bash
git clone <repo> travel-private
cd travel-private
cp .env.example .env.local   # then fill in real keys
pnpm install
pnpm db:generate              # scaffold is empty, just verifies drizzle-kit works
pnpm dev                      # http://localhost:3000
```

### Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:generate` | Generate SQL migrations from `db/schema/` |
| `pnpm db:migrate` | Apply migrations to Neon |
| `pnpm db:push` | Push schema directly (dev only) |

### Deploy to Vercel

1. Push to GitHub
2. Import the repo in Vercel
3. Configure environment variables (same as `.env.example`)
4. Add Neon integration (auto-injects `DATABASE_URL`)
5. Deploy; first deploy run `pnpm db:migrate` once

## Project structure

```
travel-private/
├── app/                # Next.js App Router routes & components
│   ├── page.tsx        # public homepage
│   ├── layout.tsx      # ClerkProvider + env validation
│   ├── (clerk)/        # sign-in / sign-up pages
│   ├── app/            # protected routes (requires login)
│   └── api/            # route handlers
├── components/ui/      # shadcn/ui components
├── lib/
│   ├── ai/             # Vercel AI SDK + DeepSeek provider
│   ├── db/             # Drizzle client entry
│   ├── schemas/        # shared zod schemas
│   ├── env.ts          # zod env validation, fail-fast
│   └── utils.ts        # cn() helper
├── db/
│   ├── schema/         # Drizzle table definitions (empty in bootstrap)
│   └── migrations/     # generated SQL (drizzle-kit)
├── scripts/            # one-off helpers (env check, etc.)
├── openspec/           # OpenSpec spec-driven dev
├── middleware.ts       # Clerk route protection
└── drizzle.config.ts
```

## Quick start with OpenSpec

Open in Claude Code. The slash commands are wired to the OpenSpec workflow:

```
/explore                  # think out loud about a problem
/propose add-itinerary    # scaffold a change proposal
/apply add-itinerary      # implement it
/archive add-itinerary    # ship it into specs/
```

For project-specific reusable workflows, drop a `SKILL.md` into `skills/<name>/`.

## Principles

- **Specs before code.** Agree on what before how.
- **Evidence over claims.** Tests, not assertions.
- **Systematic over ad-hoc.** Skills compose; workflows repeat.
- **Minimal diffs.** Fix what was asked. No scope creep.
