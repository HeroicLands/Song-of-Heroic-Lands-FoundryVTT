---
"sohl": patch
---

**Remove dangling embedded-item references from three characters**

Three NPC characters referenced embedded items whose predefined shortcodes do not
exist, so the actor-pack compile logged `no predefined item for "…"` and silently
dropped each reference:

- `Aldrik_Harvenar` — `skill:endur` (no such skill; Endurance is an attribute)
- `Alverrik_Tarvallor` — `skill:tlnt` (no such skill)
- `Brunjar_Skathhelm` — `miscgear:bgsmcvs` and `miscgear:SSton` (no such gear items)

These references already embedded nothing, so removing them leaves the compiled
actors byte-identical while clearing the errors: the actors pack now compiles with
zero `no predefined item` errors. If these abilities/items are wanted later, the
underlying skill/gear content must be authored first.

Closes #725
