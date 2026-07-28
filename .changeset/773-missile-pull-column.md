---
"sohl": patch
---

**Remove the spurious Pull column from the Being combat tab's missile strike modes**

The missile strike-mode header on the Being sheet Combat tab declared a **Pull**
column, but `MissileStrikeMode` has no pull-strength field, so the cell was bound
to `draw` as a placeholder — rendering the same value (and, since #769, the same
derivation tooltip) as the adjacent **Draw** column. The unbacked Pull column and
its duplicate row cell are removed; the missile rows now show Draw / BR / MaxVM,
each bound to its own modifier.

Closes #773
