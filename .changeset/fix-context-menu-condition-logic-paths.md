---
"sohl": patch
---

**Fix default context-menu conditions that never matched**

The default `condition` strings on the improve-flag, transmit-affliction, and
diagnosis context-menu entries — and the `improveWithSDR` action `visible`
predicate — still referenced the pre-#459 document paths (`item.system.canImprove`,
`item.system.data.improveFlag`, `item.system.canTransmit`,
`item.system.data.isTreated`). `canImprove` / `canTransmit` are getters on the
**logic** layer, not the DataModel, and `item.system.data` is not a valid
accessor, so every one of these predicates resolved to `undefined` (falsy) and
the entries stayed hidden regardless of state.

Migrated them to the logic-layer bindings (`itemLogic.canImprove`,
`itemLogic.data.improveFlag`, `itemLogic.canTransmit`,
`itemLogic.data.isTreated`), matching the affliction/trauma predicates already
migrated in #459. The Improve, Transmit, and Diagnosis entries now appear when
their underlying state holds.

Closes #458
