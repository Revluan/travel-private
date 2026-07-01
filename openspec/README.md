# OpenSpec

Spec-driven development for this repo. We agree on **what** before **how**, and we agree on **how** before code.

## Workflow

```
explore  →  propose  →  apply  →  verify  →  archive
```

| Phase | Command | Output |
|---|---|---|
| Explore | `/explore <topic>` | A rough plan or "not worth it" |
| Propose | `/propose <name>` | `openspec/changes/<name>/` with proposal, specs, design, tasks |
| Apply | `/apply <name>` | Implemented tasks, all `[x]` in tasks.md |
| Verify | `/verify <name>` | PASS/FAIL table mapping requirements to evidence |
| Archive | `/archive <name>` | Moved to `archive/<date>-<name>/`, specs merged into `specs/` |

Slash commands live in `.claude/commands/`. They work in Claude Code; other harnesses can read the same Markdown and follow along.

## Directory layout

```
openspec/
├── README.md          # this file
├── project.md         # project context — stack, goals, constraints
├── conventions.md     # spec writing rules
├── specs/             # source-of-truth specs (live here after archive)
└── changes/
    ├── <active-change>/   # current work
    └── archive/
        └── <YYYY-MM-DD>-<change-name>/   # shipped
```

## Hard rules

1. **No code before propose.** A change folder under `openspec/changes/` must exist before feature code is written. Typo fixes and one-line bugs are exempt.
2. **Specs describe behavior, not implementation.** "WHEN user submits form with invalid email, THEN show error" — not "add `if (!email.valid())` to handleSubmit."
3. **Tasks map to requirements.** Every task in `tasks.md` traces to a `REQ-###` in some `specs/*.md` file.
4. **Verify before archive.** Run `/verify` and show evidence. "Should work" is not done.
5. **Specs are fluid.** Any artifact can be edited at any time. If you discover the spec was wrong, update it — but note the change in a `## History` block.

## What goes where

| Artifact | Purpose | Lives in |
|---|---|---|
| `proposal.md` | Why and what — the motivation and the high-level delta | `changes/<name>/` |
| `specs/<capability>.md` | Requirements and scenarios — the contract | `changes/<name>/specs/` → merged into `openspec/specs/` |
| `design.md` | How — the technical approach | `changes/<name>/` |
| `tasks.md` | The implementation checklist | `changes/<name>/` |
| `project.md` | Project context that every spec assumes | `openspec/` |
| `conventions.md` | How to write a spec | `openspec/` |

## See also

- `openspec/project.md` — what this project actually is
- `openspec/conventions.md` — spec writing rules
- `../CLAUDE.md` — harness memory
- `../AGENTS.md` — cross-agent rules
