---
description: Re-verify a change against its specs — re-read specs, re-run tests, confirm every requirement is satisfied before archiving.
argument-hint: <change-name>
---

# /verify $ARGUMENTS

Re-verify the change `$ARGUMENTS` against its specs.

## What to do

1. Read `openspec/changes/$ARGUMENTS/specs/*.md` — every requirement and scenario.
2. For each requirement:
   - Find the code that implements it.
   - Find or write the test that proves it.
   - Run the test. Capture actual output.
   - Mark the requirement PASS or FAIL with a one-line reason.
3. Output a table:

```
| REQ | Scenario | Status | Evidence |
|-----|----------|--------|----------|
| 001 | name     | PASS   | tests/x.py::test_y passed |
| 002 | name     | FAIL   | off-by-one in file:line |
```

## Rules

- **Evidence is required.** "Looks right" is not PASS. Show test output, file refs, or command results.
- **FAIL stops the archive.** Tell the user what to fix before running `/archive`.
- **No new code unless a test is missing.** If a requirement has no test, write one. If the test fails, fix the code — don't weaken the spec.
