---
"sohl": minor
---

**Generic scheduled actions — `system.scheduledActions` + `sohl.schedule`**

The foundation for data-driven recurring schedules on a SoHL document (epic
#588): a document can defer an action without bespoke schema fields.

- **`scheduledActions`** on the base `SohlDataModel` (beside `actionDefs`), so it
  is carried by every document whose data model extends that base — **actors,
  items, and combatants**. Scenes and active effects extend `TypeDataModel`
  directly and cannot host a schedule. Each entry is
  `{ actionName, anchor, interval, payload }`; logical identity is `actionName`
  and the fire time is `anchor + interval`.
- **`sohl.schedule(doc, actionName, interval, payload?)`** — does both halves:
  persists the whole `system.scheduledActions` array (the durable record, anchored
  at the current world time) **and** arms the event queue (the live entry), so the
  action is offered as a `[Perform]` reminder when due. **`sohl.unschedule`** clears
  the entry and unsubscribes. Both derive the fire time from one
  `(anchor, interval)`, so they can't drift.
- **`armScheduledActions(uuid, list, queue)`** — the Foundry-free, load-side
  re-arm routine (read `system.scheduledActions` → `scheduleAt` each), used by the
  `ready` hook below.

Part of #588. Follow-up: the migration of trauma/affliction's bespoke
`recurringPhaseFields` onto this store.
