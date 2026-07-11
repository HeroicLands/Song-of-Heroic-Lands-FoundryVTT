---
"sohl": minor
---

**Being Gear tab display + carry capacity**

The Gear tab now lists gear under **On Body** and under **each container** as its
own section — each with a **Capacity** (weight carried / max) readout and
Type / Qty / Weight / Qual / Dur / Notes columns, plus the carried/worn toggles
and a per-row context menu. Container capacity comes from the container's max
capacity; On Body capacity from the being's carry weight (a being with no lineage
has 0 capacity).

Adds **`BeingLogic.maxCarryWeight`** — the maximum weight a being can carry,
derived from its greatest base move rate, its lineage's encumbrance rate, and its
strength (via the lineage's new **`encMod`** `SafeExpression` field) — available to
any logic or macro, not just the sheet. The Lineage item gains an `encMod`
expression field (default `-5 * floor((str - 10) / 2)`) so each lineage can tune
how strength shifts carry capacity.

Completes the Gear-tab epic (#301). Note: compendium lineages currently export an
empty `moveBase` (pack-export bug #362), so On Body capacity reads 0 for them
until that data is re-exported.

Closes #302
