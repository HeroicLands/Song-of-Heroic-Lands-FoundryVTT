---
"sohl": patch
---

**Constrain the actor sheet header portrait**

Fixes [#57](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/57):
the header portrait sizing rule now targets `img.actor-img` — the class the actor
header templates actually render — instead of the stale `img.profile` selector.
The portrait is held to 100px again on all five actor sheets, so the header is
compact and the tab content area gets its space back.
