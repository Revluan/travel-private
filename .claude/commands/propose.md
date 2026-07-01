---
description: Propose a new change — scaffold an OpenSpec change folder with proposal, specs, design, and tasks. No code yet.
argument-hint: <change-name>
---

# /propose $ARGUMENTS

You are entering the **propose** phase of the OpenSpec workflow.

## Preconditions

- The change name is `$ARGUMENTS`. Use kebab-case, verb-noun, e.g. `add-itinerary`, `fix-timezone-bug`.
- If `openspec/changes/$ARGUMENTS/` already exists, ask whether to resume or rename.

## What to create

Scaffold this tree:

```
openspec/changes/$ARGUMENTS/
├── proposal.md
├── specs/
│   └── <capability>.md       # one file per capability the change touches
├── design.md
└── tasks.md
```

### proposal.md

```markdown
# Proposal: <human title>

## Why
<one paragraph — the motivation. what's wrong today, what gets better>

## What changes
<bullet list of user-visible / system-visible deltas>

## Out of scope
<what this change explicitly does NOT do>
```

### specs/<capability>.md

One file per capability. Use the requirement/scenario format from `openspec/conventions.md`:

```markdown
# <Capability> spec

## Requirements
### REQ-001: <imperative title>
<one sentence stating the requirement>

#### Scenario: <name>
- **WHEN** <condition>
- **THEN** <observable outcome>
```

### design.md

```markdown
# Design: <human title>

## Approach
<which option from /explore was chosen, why>

## Components
<files/modules touched, with the role of each>

## Risks
<what could go wrong, what we're doing about it>
```

### tasks.md

```markdown
# Tasks: <human title>

- [ ] 1. <task>
- [ ] 2. <task>
- [ ] 3. <task>
```

Tasks must be small enough to verify individually. Each task maps to one or more spec requirements.

## Rules

- **No code yet.** Propose creates Markdown only.
- **Specs are requirements, not implementation.** Describe observable behavior, not lines of code.
- **Tasks map to specs.** Every task should trace to a requirement.

## After propose

Tell the user: "Change scaffolded. Review `openspec/changes/$ARGUMENTS/`. Edit any file. When ready, run `/apply $ARGUMENTS`."
