---
description: Explore a problem without commitment — read code, weigh options, shape a rough plan before proposing a change.
argument-hint: [topic or question]
---

# /explore $ARGUMENTS

You are entering the **explore** phase of the OpenSpec workflow.

## What to do

1. Read the relevant code in the repo. Use Grep, Glob, Read.
2. Read `openspec/project.md` and any related `openspec/specs/*` for context.
3. Think out loud about the problem: what's the goal, what are the options, what are the tradeoffs.
4. Consider at least two approaches. Compare them.
5. End with one of:
   - A rough plan that's ready to become a `/propose`.
   - "Not worth doing — <reason>."
   - "Need more info — <specific question for the user>."

## Rules

- **No file changes.** Explore is read-only. Do not create `openspec/changes/` yet.
- **No commitment.** The user can discard everything you say here.
- **Be concrete.** Reference real files, line numbers, existing patterns. No vague "we could improve the architecture."

## Output shape

```
## Goal
<one sentence>

## Current state
<what the code does today, with file:line refs>

## Options
A. <approach> — <tradeoff>
B. <approach> — <tradeoff>

## Recommendation
<which one, why>

## Next step
/propose <name>   OR   "not worth it"   OR   "need: <question>"
```
