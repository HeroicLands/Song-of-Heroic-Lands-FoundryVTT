---
"sohl": minor
---

**Timed effects offer to reschedule instead of auto-re-arming, on the generic store**

Recurring trauma and affliction effects no longer silently re-arm their next
occurrence — completing the consent model for timed effects (issue #579, building
on #587's remind-don't-perform) — and their schedules move off bespoke schema
fields onto the generic `system.scheduledActions` store (the migration named as a
follow-up of #588).

- **Offer, don't auto-re-arm.** After a recurring check is performed
  (`healingCheck` / `bloodLossAdvanceCheck` / `courseCheck` on Trauma, `healingCheck`
  on Affliction), the executor **offers** the next occurrence — via
  `context.scope.reschedule` when scripted, otherwise a private yes/no dialog
  defaulting to **No** — through the shared `offerReschedule` helper. Accept
  schedules the next; decline clears it (the loop stops and does not resurrect on
  reload). A terminal outcome (a wound healed to 0, a course death/recovery, a
  defeated affliction) ends the recurrence outright. Affliction phase transitions
  (`onsetCheck` → `resolutionCheck`) still advance automatically — the disease
  progresses as the direct consequence of the human-performed step; only their
  _firing_ is consent-gated.
- **Migrated onto `system.scheduledActions`.** The recurrence anchor now lives in
  the generic store entry (`anchor + interval`), so the bespoke `lastHealingCheckDate`
  / `lastBloodLossAdvanceDate` / `lastCourseDate` fields are removed
  (`recurringPhaseFields` → a new `durationFields` interval pair). Creation and
  becoming-a-bleeder still auto-arm the _first_ occurrence (via `sohl.schedule`).
- **Generic re-arm in `finalize()`.** Each effect's `finalize()` now re-arms
  whatever `system.scheduledActions` holds (`armScheduledActions`) rather than
  hard-coding per-effect branches — so a reschedule written on one client
  replicates and re-arms every client's queue, the active GM's included.
- **Generic run record — `system.lastRun`.** A single keyed map (`actionName` →
  world-time) on the base data model, the past-tense mirror of `scheduledActions`,
  stamped automatically at the action chokepoint (`SohlAction.execute`) for actions
  whose definition sets `recordsLastRun`. So "when was my last healing test?" is
  answerable — `injury.system.lastRun.healingCheck` — for **any** action with no
  bespoke field, and it survives after a declined or resolved effect (where the
  next occurrence, `sohl.events.nextFireTime(uuid, actionName)`, is gone). For an
  event-driven trigger whose next fire is undeterminable, this run record is the
  only meaningful temporal fact.
- **New SafeExpression helpers `curWorldTime()` / `curCombatTime()`.** Event-queue
  subscription **predicates** can now gate on live world or combat time from any
  trigger (`curWorldTime() > T`; `defined(curCombatTime()) && curCombatTime().round > 3`),
  reading through Foundry-free shims — the flexible escape hatch alongside the
  concrete, introspectable `fireAt`.

Refs #579, #588.
