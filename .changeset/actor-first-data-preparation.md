---
"sohl": minor
---

**Actor-first data preparation with post-phase action executors**

`SohlActor.prepareDerivedData` now interleaves the actor's own logic phases with
its items' phases instead of running the actor entirely after every item, and it
dispatches post-phase intrinsic-action executors.

- Order per preparation cycle: actor `initialize` → items `initialize` (then
  items' initial Active Effects) → actor `evaluate` → items `evaluate` → items
  `finalize` → actor `finalize`. The actor's `initialize` and `evaluate` now
  precede the items' corresponding phases, so actor-level state (e.g. `pull` and
  the body structure) is ready before weapons resolve their available strike
  modes.
- After each phase, the matching `postInitialize` / `postEvaluate` /
  `postFinalize` intrinsic action (when one is defined) is executed for the actor
  and for each item, alongside the existing `sohl.*.post*` hooks.
