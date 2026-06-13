---
"sohl": patch
---

**Repair sheet layout broken by a dead CSS scope**

Fixes [#87](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/87):
the Being sheet (and every other SoHL document sheet) rendered with an oversized
header and cramped tab content. The sheet-layout rules in `_top.scss` lived inside
a top-level `.sheet { … }` block, but because the stylesheet loads each component
inside `.sohl { }` they compiled to the descendant selector `.sohl .sheet`. Foundry's
ApplicationV2 places `sohl`, `sheet`, and the sheet-type class on the **same** frame
element, so that descendant selector never matched and the whole block — including
the portrait size cap and the tab-body height — was silently dead.

The block now lives in its own `components/_sheet.scss` partial, loaded under the
compound `.sohl.sheet` selector so it matches the frame as intended. This also
explains why the earlier `img.profile` → `img.actor-img` rename (#57) had no visible
effect: the rule it edited never applied.
