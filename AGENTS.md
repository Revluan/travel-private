# AGENTS.md — cross-agent rules

This file is for any coding agent working in this repo — Claude Code, Codex, Cursor, Gemini CLI, Kimi, OpenCode, Pi, etc. CLAUDE.md is the harness-specific memory; this file is the universal contract.

## Workflow

Spec-driven. See `openspec/README.md` for the full OpenSpec cycle. In short:

1. **Explore** before proposing.
2. **Propose** before implementing. A change folder under `openspec/changes/` must exist before feature code is written.
3. **Apply** the tasks checklist.
4. **Archive** when done — move to `openspec/changes/archive/<YYYY-MM-DD>-<name>/` and merge specs into `openspec/specs/`.

## Skills

The Superpowers plugin (or its equivalent on your harness) provides standard workflows: brainstorming, writing-plans, TDD, systematic-debugging, code-review. Use them. They are mandatory, not suggestions.

Project-specific skills live in `skills/<name>/SKILL.md`.

## Non-negotiables

- **Specs before code.** No change folder, no feature code. (Typo fixes and one-line bugs are exempt.)
- **Evidence over claims.** Run tests. Show output. "Should work" is not done.
- **Minimal diffs.** Do what was asked. No surprise refactors.
- **Verify your own edits.** Read the file after writing. Run the test after claiming it passes.
- **No destructive git ops without explicit user approval.** No `--force`, `--no-verify`, `reset --hard`, `branch -D`.
- **No new files when an existing one fits.** Prefer edits to creation.
- **Comments only when WHY is non-obvious.** One line max.

## File map

- `openspec/` — specs and changes
- `openspec/specs/` — source-of-truth specs
- `openspec/changes/` — active proposals
- `openspec/changes/archive/` — shipped proposals
- `skills/` — project skills
- `docs/` — long-form docs, ADRs
- `.claude/` — Claude Code harness config (other harnesses: ignore)
