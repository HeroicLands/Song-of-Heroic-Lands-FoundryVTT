---
"sohl": minor
---

**Scheduled-action load-side + world host — `ready` re-arm, `sohl.worldHost`, GM-hidden reminders**

The load-and-execute half of the generic scheduler (epic #588): persisted
schedules survive a reload, world-scoped schedules get a home, and the reminders
they raise can be kept GM-only.

- **Re-arm on load.** `SohlHookBridge` wires a **`ready`** hook that arms every
  world actor's `system.scheduledActions` — and each actor's embedded items' —
  back into the event queue. Not GM-gated: the queue is a projection of document
  state, so every client re-arms from the documents it can see. New
  `fvttWorldActors()` shim so the wiring crosses the Foundry boundary and stays
  unit-testable.
- **`sohl.worldHost()`** — find-or-creates the singleton `_sohlworld` actor
  (reserved shortcode, ownership NONE so only the GM sees it; GM-only creation).
  It is the document that world-scoped schedules hang off of, and being an actor it
  already has the execution surface (`onChatCardButton` + an `actions` collection)
  a `[Perform]` reminder needs.
- **GM-hidden reminders.** A schedule whose payload carries `visibility: "gm"` is
  offered as a GM whisper (`SohlSpeaker` now honors a per-call `rollMode`), so
  world-host events don't leak to players.

Part of #588.
