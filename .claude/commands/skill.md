---
description: Create a new project-scoped skill under skills/ — a reusable workflow that composes with Superpowers.
argument-hint: <skill-name>
---

# /skill $ARGUMENTS

Create a new project skill at `skills/$ARGUMENTS/SKILL.md`.

## When to use this

Only when a workflow has repeated three times and you want to codify it. Skills are not for one-off tasks.

## What to create

```
skills/$ARGUMENTS/
└── SKILL.md
```

### SKILL.md frontmatter

```markdown
---
name: $ARGUMENTS
description: <one sentence — when this skill should activate>
---

# $ARGUMENTS

## When to use
<specific triggers — what the user said or what the task is>

## Workflow
1. <step>
2. <step>

## Examples
<one concrete example with real file paths>
```

## Rules

- **Skills compose with Superpowers, never replace it.** If a Superpowers skill already does this, don't write a new one.
- **Trigger must be specific.** "When touching the itinerary module" beats "when working on features."
- **One skill = one workflow.** Don't bundle.

After creating, tell the user: "Skill scaffolded at `skills/$ARGUMENTS/SKILL.md`. Edit it to match the real workflow."
