---
"sohl": minor
---

**Event queue: populate on all clients, fire on the active GM only, add a query API**

`sohl.events` is now a pure projection of document state. `subscribe`,
`unsubscribe`, and `scheduleAt` run on **every** client (a player's queue is a
permission-scoped subset of the active GM's); only `fire` remains gated to the
active GM. This lets sheets query event dates locally on any client.

Adds a read-only query API — `nextFireTime(uuid, kind)`, `timeUntil(uuid, kind)`
(signed seconds from now), and `isScheduled(uuid, kind)`.

Dispatch is now **single-pass**: each due subscription fires once and the queue no
longer cascades re-armed successors within one `fire`. Recurring catch-up over a
time jump is the consuming document's responsibility (an elapsed-interval loop in
its handler that persists the advanced anchor), with `finalize()` re-arming the
next occurrence — keeping the queue a projection that never evolves schedule state
inside the GM-only `fire`. The same-tick loop guard is removed (no longer needed);
the reentrancy depth backstop remains.

The Event Queue reference doc is rewritten accordingly, including the
owner-persists-the-anchor contract and a corrected worked example.

Closes #480.
