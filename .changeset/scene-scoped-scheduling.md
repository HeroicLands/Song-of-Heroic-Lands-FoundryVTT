---
"sohl": minor
---

**Scene-scoped scheduled actions — `sohl.schedule(..., sceneUuid?)`**

A scheduled action (#588) can be bound to a scene so it fires only where it
belongs — bandits at a hideout, a hazard on a caravan path — instead of ticking
world-wide (issue #590).

- **`sohl.schedule(doc, actionName, interval, payload?, sceneUuid?)`** — the new
  optional `sceneUuid` persists to the `system.scheduledActions` entry (blank =
  world-wide) and is threaded through the arm half. `armScheduledActions` restores
  it on reload.
- **Gate at offer time.** `SohlEventQueue.fire` skips a due, scene-bound
  subscription while its scene is not the active scene (`fvttActiveSceneUuid`) —
  **without consuming it**, so it stays armed and surfaces when the scene next
  becomes active (a check that came due while away is waiting on return). A
  world-wide schedule (no `sceneUuid`) is unaffected.
- **Immediate on arrival.** An `updateScene` hook re-scans the queue at the
  current world time when a scene's `active` flag flips true, so a pending check
  for the newly-active scene surfaces the instant the party arrives rather than on
  the next time tick. Re-offer stays idempotent via the existing offered-dedupe.
- A schedule on an unlinked token's actor is naturally scene-scoped: name its
  token's scene.

Part of #590.
