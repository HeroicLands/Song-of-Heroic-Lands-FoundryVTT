---
"sohl": minor
---

**Being Combat tab: Body Locations tree**

The Combat tab now shows a read-only **Body Locations** tree — each body **part**
with its hit **locations** (the current model has parts and locations; the old
zone grouping is gone). Every location shows its covering armor **Layers**
(material list), hit **Prob**ability, **Shock**, **Impair**ment, and per-aspect
protection **B / E / P / F** as the **effective total** — natural `protectionBase`
plus the aggregate of all currently-worn armor mapped to that location. The part
header shows the **Held** item, and a search box filters locations by name.

The view is read-only (no add / remove / rearrange — that lives on the Lineage
sheet). Layer/total contributions require worn armor whose covered locations are
stored as location shortcodes; compendium armor still stores them as names
(#249), so its contribution won't appear until that lands.
