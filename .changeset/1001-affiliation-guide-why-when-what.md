---
"sohl": patch
---

**Docs: rewrite the Affiliation user-guide page to answer why / when / what**

The Affiliation item's user-guide page (`User_Guide/Items/Item_Affiliation.md`) was a
bare field list. It now leads with purpose:

- **Why use one** — an Affiliation is a _credential_: it records a character's
  membership and, above all, their _rank_ within an organized body, kept in one
  canonical place rather than scattered across other items.
- **When to use one** — worked cases covering **religion** (with `Level` as rank in
  the hierarchy), **arcane school** (with `Level` as grade), **faction membership**,
  **criminal organizations**, and guilds / noble houses / military units.
- **What to put here** — field-by-field guidance for `Society` / `Office` / `Title` /
  `Level`, with the rank ladder explained (lay member → initiate → ordained).

A note steers religious and arcane rank onto the Affiliation's `Level` rather than the
_Level_ bolt-on it has been tracked with on ritual/arcane Skills. Also fixes a typo
(_"fullly"_) and cross-links Mystery, Mystical Ability, and Skill. Documentation only;
no behaviour change.

Closes #1001
