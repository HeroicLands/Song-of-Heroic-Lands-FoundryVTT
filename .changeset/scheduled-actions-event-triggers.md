---
"sohl": minor
---

**Persisted schedules can bind to lifecycle triggers, not just world time**

The generic scheduled-actions store (`system.scheduledActions`) previously
persisted only **time-based** schedules — every entry fired at `anchor +
interval` via `updateWorldTime`. It now also persists **event-driven** schedules
bound to a lifecycle trigger (`turnEnd`, `roundEnd`, `combatStart`, …, and the
scene-region families from #593), so a check whose cadence is a combat moment has
a durable home and re-arms across a reload — the same way a timed one does.

- **New optional `triggerName`** on each `scheduledActions` entry. Blank (the
  default) or `"updateWorldTime"` keeps the original time behavior; any other
  value makes the entry event-driven, armed as a live subscription on that trigger
  with `interval` unused. Backwards compatible — an entry written before this
  change has no trigger and stays time-based, with no migration.
- **`armScheduledActions` / `scheduleAction`** arm a time entry via `scheduleAt`
  (as before) and an event entry via `subscribe`; **`sohl.schedule`** and the
  shared **`offerSchedule`** take an optional `triggerName`, and the offer prompt
  reads "…at the end of each turn?" for an event cadence instead of "…in 5 days?".
- An event entry may also carry an optional **`predicate`** source (a
  `SafeExpression`) to gate its dispatch; the queue binds **`subscriberUuid`** (the
  subscription's own document) so a predicate can compare the trigger to itself —
  e.g. scoping a `turnEnd` schedule to the subscriber's own combat turn.
- Both families flow through the one owner-gated `[Perform]` reminder path
  (issue #579); time schedules still dedupe by `fireAt`, event schedules still
  offer once per fire.

Closes #622
