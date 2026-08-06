---
"sohl": patch
---

**Mystery items no longer offer a "Use Mystery" action**

Fixes [#1089](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1089):
a Mystery carried a visible **Use Mystery** intrinsic action on its sheet's
Actions tab and in its context menu that only ever posted _"Using '{name}' is not
yet implemented."_

A Mystery models what a character **is** — a standing condition, pool, or
blessing — while anything a character actively **invokes** is a Mystical Ability,
which has its own action and roll. There is no universal meaning to "using" a
Mystery, so the action is removed rather than implemented; a subtype that should
be spent down is driven by whatever consumes it. A Mystery's effect continues to
apply as derived state (a Boon or Boost delta onto its associated skill) or
through its Active Effects, and the item keeps the shared base actions (edit,
delete, output description to chat).
