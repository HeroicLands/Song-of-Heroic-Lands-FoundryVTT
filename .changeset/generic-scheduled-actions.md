---
"sohl": minor
---

**Generic scheduled actions — `system.scheduledActions` + `sohl.schedule`**

The foundation for data-driven recurring schedules on any SoHL document (epic
#588): a document can defer an action without bespoke schema fields.

- **`scheduledActions`** on the base `SohlDataModel` (beside `actionDefs`), spread
  into every SoHL document (item / actor / scene / combatant): an array of
  `{ actionName, anchor, interval, payload }`. Logical identity is `actionName`;
  the fire time is `anchor + interval`.
- **`sohl.schedule(doc, actionName, interval, payload?)`** — does both halves:
  persists the whole `system.scheduledActions` array (the durable record, anchored
  at the current world time) **and** arms the event queue (the live entry), so the
  effect is offered as a `[Perform]` reminder when due. **`sohl.unschedule`** clears
  + unsubscribes. Both derive the fire time from one `(anchor, interval)`, so they
  can't drift.
- **`armScheduledActions(uuid, list, queue)`** — the Foundry-free, load-side
  re-arm routine (read `system.scheduledActions` → `scheduleAt` each), for the
  scope-matched hooks to come.

Part of #588. Follow-ups: the re-arm hooks (`canvasReady` / `ready`), the
`_sohlworld` world host, card visibility, the scene execution surface, and the
migration of trauma/affliction's bespoke `recurringPhaseFields` onto this store.
