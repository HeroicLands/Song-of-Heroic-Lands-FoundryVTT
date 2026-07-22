---
"sohl": minor
---

**Shock Re-Test is offered on its cadence when a being enters shock**

`BeingLogic.shockReTest` (#556) could only be run on demand. A being that enters
ordinary shock is now **offered** (never auto-armed) a Re-Test reminder on the
state's cadence, per the consent model — the being-level timing half of #556.

- **Incapacitated** → an event-driven `turnEnd` schedule (#622): a `[Perform]`
  Re-Test card is offered at the end of each combat turn.
- **Unconscious** → a time schedule ten minutes out.

Entering shock (via an injury Shock Test) routes through the shared
`offerSchedule`, so nothing schedules or runs without a human; when due, the event
queue posts an owner-gated `[Perform]` card to the being's controller, and the
Re-Test runs only on their click. Performing a Re-Test — or recovering, or falling
into a lasting Extended Shock / Coma (whose recovery is a Course Test) — clears the
ordinary reminder rather than auto-re-arming. `BeingLogic.finalize` now re-arms a
being's persisted schedules on load.

Closes #569
