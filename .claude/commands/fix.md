---
description: Lightweight fix workflow for bugs and small adjustments — analyze, fix, verify, summarize. No spec overhead.
argument-hint: <description of the issue>
---

# /fix $ARGUMENTS

You are entering the **fix** workflow — for bugs, tweaks, and small adjustments that don't warrant a full proposal.

## Process

### 1. Analyze — locate the problem

- Read the relevant code. Trace the code path from symptom to root.
- Identify the exact file(s) and line(s) involved.
- State the root cause in one sentence.

### 2. Design — plan the fix

- Describe the fix in 2-3 sentences.
- Confirm it's minimal — no refactors, no "while I'm here" edits.
- If the fix touches more than 2 files or changes behavior beyond the bug, stop and suggest `/propose` instead.

### 3. Execute — apply the fix

- Make the change. Keep it small.
- If tests exist for this area, run them.
- If the bug had no test coverage, add a minimal regression test.

### 4. Verify — prove it works

- Run the relevant tests. Show the output.
- If it's a UI fix, describe what changed and why it's correct.
- Confirm no regressions in related tests.

### 5. Summarize

Output a short summary:

```
## Fix Summary

**Root cause:** <one sentence>
**Fix:** <what changed, file:line>
**Evidence:** <test output or verification>
```

## Rules

- **Minimal diffs.** One bug, one fix. No bundling unrelated changes.
- **Evidence over claims.** Show the test passing. Don't say "should work."
- **If the scope creeps** — the fix reveals a bigger problem — stop and tell the user to `/propose` for the larger work. Ship the minimal fix first.

## After fix

The change is committed directly. No archive step. No spec merge. The commit message and this summary are the record.
