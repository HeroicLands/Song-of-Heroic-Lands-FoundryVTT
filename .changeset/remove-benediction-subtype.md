---
"sohl": patch
---

**Remove `BENEDICTION` as a separate Mystical Ability subtype**

A benediction is not mechanically distinct from a **Ritual Action** — it is
performed as one — so `BENEDICTION` is dropped from `MYSTICALABILITY_SUBTYPE`.
The two shared an identical Being-sheet column layout (Skill / EML / Charges /
Notes, no Level) and `benediction` carried no special logic branch, so removing
it collapses a redundant subtype and drops a superfluous section from the
Mysteries tab. Author a benediction as a Ritual Action instead.

The `SOHL.MysticalAbility.SubType.benediction` and orphan
`SOHL.MysticalAbility.Category.benediction` localization strings and the
user-guide entry are removed with it. Pre-beta, no released worlds, so no data
migration is required.

Closes #1013
