---
"sohl": minor
---

**Scene-region & environment event triggers — react to where characters are, not just when**

The event queue now dispatches an **event-driven** family of triggers alongside
time and combat: Foundry v14 scene-region events, plus scene darkness changes.
This is the epic #593 bridge — the curated triggers, the GM opt-in surface, and
the consent-gated offer.

- **A "SoHL Event Trigger" RegionBehavior** (`trigger`) a GM drops onto a
  region to opt it into SoHL triggering. It forwards a **curated** event set —
  `regionTokenEnter` / `regionTokenExit` / `regionTokenTurn{Start,End}` /
  `regionTokenRound{Start,End}` — into the queue, GM-gated so it dispatches once
  (not once per client). Continuous / view-dependent streams (`tokenMove*`,
  `tokenAnimate*`) are deliberately excluded to keep the queue from flooding.
  Optionally names an **action to offer** the entering token's actor.
- **`sceneDarknessChange`** — a scene environment trigger fired from
  `SohlHookBridge` on `updateScene` when the darkness level changes.
- **Consent throughout.** A due region trigger surfaces as an owner-gated
  `[Perform]` reminder — no character is acted on without a click. Both hosts
  work: a region-authored action, and a per-character `sohl.events.subscribe(...)`
  scoped by predicate on `regionId` / `actorUuid`.
- **Event-driven contract.** These triggers have no `fireAt`, so `nextFireTime`
  is `undefined` by design; the generic run record (`system.lastRun`) answers
  "when did this last happen here?".

A new consent primitive `sohl.events.offer(uuid, actionName, ctx)` is extracted
from the queue's existing reminder path and reused by the region bridge.

Closes #593, #606, #607, #608
