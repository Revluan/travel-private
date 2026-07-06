---
name: "source-command-status"
description: "Show the OpenSpec workflow status — active changes, recent archives, and what's in the specs/ source of truth."
---

# source-command-status

Use this skill when the user asks to run the migrated source command `status`.

## Command Template

# /status

Show the current state of the OpenSpec workflow in this repo.

## What to do

1. List active changes — every subdirectory of `openspec/changes/` (excluding `archive/`). For each, show:
   - Name
   - Tasks done / total (count `[x]` vs `[ ]` in `tasks.md`)
   - One-line summary from `proposal.md`'s first line

2. List recent archives — last 5 from `openspec/changes/archive/`, name only.

3. List stable specs — every file in `openspec/specs/`, with the count of `### REQ-` blocks in each.

## Output shape

```
## Active changes
- add-itinerary (3/8 tasks) — Add itinerary planning capability
- fix-timezone-bug (2/2 tasks) — Fix off-by-one in timezone conversion

## Recent archives
- 2026-06-28-add-auth
- 2026-06-20-init-project

## Stable specs
- auth.md (5 requirements)
- itinerary.md (12 requirements)
```

If `openspec/changes/` is empty, say so and suggest `/explore` to start.
