# Project skills

This directory holds **project-scoped skills** — reusable workflows that compose with the [Superpowers](https://github.com/obra/superpowers) plugin.

Superpowers provides the standard workflows (brainstorming, writing-plans, TDD, systematic-debugging, code-review). Those fire automatically. Skills here extend Superpowers for this project's specific patterns.

## When to add a skill

Only when a workflow has repeated three times. Skills are not for one-off tasks.

For example:
- "Whenever I plan an itinerary, I want a checklist that includes visa checks, timezone math, and a budget pass." → `skills/plan-itinerary/SKILL.md`
- "Whenever I touch the geo-coding code, I want to re-run the boundary tests first." → `skills/geo-coding-safety/SKILL.md`

## How to create one

Run `/skill <name>` in Claude Code. It scaffolds:

```
skills/<name>/
└── SKILL.md
```

The SKILL.md frontmatter tells the harness when to activate. Edit it to match the real workflow.

## Rules

- **Compose, don't replace.** If Superpowers already does it, don't write a skill.
- **One skill = one workflow.** Don't bundle.
- **Triggers must be specific.** "When touching the itinerary module" beats "when working on features."
- **Keep them short.** A skill is a checklist with triggers, not a textbook.

## Current contents

(none yet)
