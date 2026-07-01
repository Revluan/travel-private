---
description: Apply a proposed change — implement tasks from the checklist, mark each complete, verify against specs.
argument-hint: <change-name>
---

# /apply $ARGUMENTS

You are entering the **apply** phase of the OpenSpec workflow.

## Preconditions

- `openspec/changes/$ARGUMENTS/` must exist. If not, tell the user to run `/propose $ARGUMENTS` first.
- Read `proposal.md`, `specs/`, `design.md`, and `tasks.md` in that folder before doing anything.

## What to do

1. Read `tasks.md`. Find the first unchecked `- [ ]`.
2. Implement that task. Follow `design.md`. Satisfy the matching requirement in `specs/`.
3. Verify the work — run the relevant tests, read the files you changed, confirm the requirement is met.
4. Mark the task `- [x]` in `tasks.md`. Commit if the user wants commits (ask once at the start).
5. Move to the next unchecked task. Repeat until all tasks are `[x]`.

## Rules

- **One task at a time.** Don't batch. Don't skip ahead.
- **Verify before checking.** A task is `[x]` only after you've confirmed the work. Run the test, read the file. "Should work" is not done.
- **Stay in scope.** If a task reveals more work, add it to `tasks.md` — don't silently expand.
- **Specs are the contract.** If the implementation can't satisfy a spec, stop and tell the user. Update the spec, not the behavior, by editing `specs/` and noting the change in `proposal.md`.
- **Minimal diffs.** No surprise refactors. No "while I'm here" edits.
- **Use the Superpowers workflows.** TDD, systematic-debugging, code-review fire as needed — let them.

## When all tasks are done

Tell the user: "All tasks complete. Run `/verify $ARGUMENTS` to re-check against specs, or `/archive $ARGUMENTS` to ship."
