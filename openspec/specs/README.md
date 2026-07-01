# Stable specs

This directory holds the **source-of-truth** specs for the project — the ones that have been through the OpenSpec cycle and archived.

Every spec here was once a delta in `openspec/changes/<name>/specs/`. When that change was archived, the delta was merged into this directory.

## How to read these

- Each file is one capability.
- Requirements are numbered `REQ-###` and never renumbered.
- The `## History` section at the bottom of each file lists which archived change contributed what.

## How to update these

You don't edit them directly — you propose a change:

1. `/explore <topic>`
2. `/propose <name>` — the change folder gets its own `specs/` delta
3. `/apply <name>` — implement
4. `/verify <name>` — re-check against specs
5. `/archive <name>` — delta merges into this directory

Direct edits here are fine for typo fixes, but anything substantive should go through the cycle.

## Current contents

(empty — no changes have been archived yet)
