# Spec conventions

How to write a spec that's worth writing.

## A spec describes behavior, not code

Good:

> #### Scenario: invalid email shows error
> - **WHEN** the user submits the form with "not-an-email"
> - **THEN** the email field shows "Enter a valid email"
> - **AND** the form is not submitted

Bad:

> #### Scenario: invalid email
> - The handleSubmit function checks `email.includes("@")` and sets `error = true`.

The first spec is testable and survives a rewrite. The second one dies the moment the implementation changes.

## File structure

One file per capability, named `kebab-case.md`. A capability is a coherent area of behavior — "auth," "itinerary," "budget-tracking" — not a single feature.

```markdown
# <Capability> spec

## Purpose
<one sentence — what this capability gives the user>

## Requirements

### REQ-001: <imperative title>
<one sentence — what must be true>

#### Scenario: <name>
- **WHEN** <condition>
- **THEN** <observable outcome>
- **AND** <optional extra outcome>

#### Scenario: <another name>
- **WHEN** <condition>
- **THEN** <outcome>

### REQ-002: <title>
...

## History
- 2026-06-30 — initial spec (from `add-<capability>` change)
- 2026-07-15 — REQ-003 added (from `add-<x>` change)
```

## Requirement IDs

- `REQ-###`, zero-padded to 3 digits, unique within a file.
- Numbers never shift. If REQ-002 is removed, REQ-003 stays REQ-003.
- New requirements get the next available number.

## Scenarios

- Use WHEN/THEN/AND. Avoid "IF" — specs describe behavior, not control flow.
- One scenario per distinct case. Don't combine "happy path + error" in one.
- Scenarios should be observable. "THEN the database has a row" is fine; "THEN the ORM calls save()" is not.

## What NOT to put in a spec

- Implementation details (function names, file paths, library choices).
- Performance numbers (those go in `design.md`).
- UI layout (those go in `design.md` or a separate `ui/` artifact).
- Internal scheduling ("this will be built in sprint 3").

## When specs change

- During a change: edit `openspec/changes/<name>/specs/<capability>.md`. That's the delta.
- On archive: merge the delta into `openspec/specs/<capability>.md`. Add a `## History` line.
- After archive: the live spec is in `openspec/specs/`. The archive copy is frozen history.

## Spec smells

- "REQ-001: the system should be fast." — untestable. Pick a number.
- "REQ-002: the system handles errors gracefully." — meaningless. Name the error and the behavior.
- "REQ-003: uses React." — implementation. Delete it.
- A spec with no scenarios. — add scenarios or delete the requirement.
