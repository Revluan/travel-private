# CLAUDE.md — travel-private

This file is the harness memory. Read it first, every session.

## Project

`travel-private` is a private travel study project. Stack is undecided — see `openspec/project.md` for the current picture and `openspec/specs/` for what's been agreed so far.

## Workflow — OpenSpec (mandatory)

Every non-trivial change follows the OpenSpec cycle. Use the slash commands in `.claude/commands/`:

1. `/explore` — read, think, no commitment. Output: a rough plan or "not worth doing."
2. `/propose <name>` — scaffold `openspec/changes/<name>/` with `proposal.md`, `specs/`, `design.md`, `tasks.md`.
3. `/apply <name>` — implement tasks one by one. Mark each `[x]` in `tasks.md` when done.
4. `/archive <name>` — move the change to `openspec/changes/archive/<YYYY-MM-DD>-<name>/` and merge its specs into `openspec/specs/`.

**No code is written before the change folder exists.** Small fixes (typo, one-line bug) can skip this — use judgment, but when in doubt, propose.

Specs are fluid: any artifact can be edited at any time. There are no rigid phase gates, but there *is* a "spec must exist before code" gate.

## Skills — Superpowers (compose, don't repeat)

The Superpowers plugin is installed via Claude Code's plugin marketplace. It provides the standard workflows: brainstorming, writing-plans, TDD, systematic-debugging, code-review, etc. Those fire automatically when triggered.

Project-specific skills live in `skills/<name>/SKILL.md`. They extend — never replace — Superpowers. Create one with `/skill <name>` when a workflow repeats three times.

## Rules

- **Specs before code.** If `openspec/changes/<name>/` doesn't exist, don't write the feature.
- **Evidence over claims.** Run the tests. Show the output. Don't say "should work" — show it working.
- **Minimal diffs.** Fix what was asked. No refactors, abstractions, or "while I'm here" edits unless explicitly requested.
- **No comments unless WHY is non-obvious.** WHAT is in the code; WHY is in the commit and the spec.
- **Verify before claiming done.** Read the actual file after editing. Run the actual test. Trust but verify, especially your own edits.

## Where things live

| Need | Look in |
|---|---|
| Project context | `openspec/project.md` |
| Spec writing rules | `openspec/conventions.md` |
| Active changes | `openspec/changes/` |
| Stable specs (source of truth) | `openspec/specs/` |
| Project skills | `skills/` |
| Long-form docs, ADRs | `docs/` |
| Harness config | `.claude/settings.json` |
| Slash commands | `.claude/commands/` |

## Memory

The auto-memory system lives at `~/.claude/projects/-Users-user-Desktop-study-travel-private/memory/`. Use it for: user role, feedback (corrections + validated approaches), project context that's not in the code, references to external systems. Don't use it for: code patterns, git history, debugging recipes — those are in the code.

## Don't

- Don't skip the spec because "it's obvious." Write the proposal anyway.
- Don't run `--no-verify`, `--force`, `reset --hard`, or any destructive git op without explicit approval.
- Don't create new files when editing an existing one would do.
- Don't add error handling for scenarios that can't happen.
- Don't write multi-paragraph docstrings. One line max, only when WHY is non-obvious.
