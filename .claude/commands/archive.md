---
description: Archive a completed change — move to dated archive folder and merge specs into openspec/specs/.
argument-hint: <change-name>
---

# /archive $ARGUMENTS

You are entering the **archive** phase of the OpenSpec workflow.

## Preconditions

- `openspec/changes/$ARGUMENTS/` must exist.
- All tasks in `tasks.md` should be `[x]`. If any are unchecked, warn the user and stop.

## What to do

1. Read `openspec/changes/$ARGUMENTS/specs/*.md`. These are the change's spec deltas.
2. Merge each delta into the corresponding file under `openspec/specs/`:
   - If the capability spec doesn't exist yet, create `openspec/specs/<capability>.md`.
   - If it exists, merge new requirements and scenarios. Preserve existing requirement IDs; append new ones with the next available number.
   - If the change modifies an existing requirement, update it in place and note the change in the spec's `## History` section (create the section if missing).
3. Move the entire change folder to `openspec/changes/archive/<YYYY-MM-DD>-$ARGUMENTS/`. Use today's date.
4. Tell the user what was merged and what was moved.

## Rules

- **Merge, don't copy.** The archive copy stays as a historical record. The live `openspec/specs/` files are the source of truth going forward.
- **Preserve IDs.** Existing requirement numbers (REQ-001, REQ-002, ...) must not shift. New requirements get the next number in their capability file.
- **Don't touch code.** Archive is a docs operation.

## After archive

Tell the user: "Archived to `openspec/changes/archive/<date>-$ARGUMENTS/`. Specs merged into `openspec/specs/`. The change is now part of the source of truth."
