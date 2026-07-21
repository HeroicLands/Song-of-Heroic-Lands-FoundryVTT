---
"sohl": patch
---

**Scheduled-action re-arm hooks (`ready` / `canvasReady`)**

The load-side of the generic scheduler (epic #588): persisted schedules are
re-armed into the event queue from document state, matching the schedule's scope.

- `SohlHookBridge` wires a **`ready`** hook (arm every world actor's
  `system.scheduledActions` — including the `_sohlworld` host) and a
  **`canvasReady`** hook (arm the active scene's — so a scene's ambient events are
  live only while it is the active scene). Not GM-gated: the queue is a projection
  of document state, so every client re-arms from the documents it can see.
- New `fvttWorldActors()` shim (with `getActiveScene`) so the wiring goes through
  the Foundry boundary, keeping it unit-testable.

Part of #588.
