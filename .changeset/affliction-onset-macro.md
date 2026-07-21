---
"sohl": minor
---

**Affliction onset effect + optional onset Macro**

At onset, an affliction now runs its onset effect: it is already marked
symptomatic (`onsetDate` crystallized) and starts its course/resolution cycle —
symptoms themselves are role-played, out of VTT scope — and it may name an
**optional onset Macro**. A new `system.onsetMacroUuid` (a Macro UUID reference,
never source) runs once on the active GM right after onset is recorded, with a
`scope` of `{ affliction, actor }`, and may schedule further events. See the
House Rules Cookbook (Recipe 4) for authoring. Part of #548. Closes #488
