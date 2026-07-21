---
"sohl": minor
---

**Chat Sequence engine core**

A new Foundry-free engine (`entity/sequence`) for authoring consent-gated,
multi-step, multi-party interactions as declarative step graphs — the foundation
of the Chat Sequence framework (after the dispatch-chokepoint consolidation).

- **Types** — `SequenceDefinition` (`roles` + a step graph), `SequenceStep`
  (`{ by: role, card, choices[] }`), and `SequenceChoice`
  (`{ key, label, when?, action, scope?(state)→actionScope, reduce?(state,result)→state, next }`).
  The threaded **ledger** state is kept distinct from an individual action's
  `context.scope`.
- **Registry** — `defineSequence` / `getSequence`, with `validateSequence`
  checking the initial step, every static `next` target, and each step's `by`
  role.
- **Pure engine** — `startInstance`, `renderableChoices` (filter by `when`),
  `advanceSequence` (fold via `reduce`, compute `next`, terminate on `null`), and
  `buildSequenceCardData` (title/body + the acting role's handler uuid + one
  button per choice).
- **Treatment sequence** — the reference implementation (patient requests →
  physician performs → patient accepts), defined as data.

The Foundry runtime (a generic sequence card, click-advance routing through the
shared dispatch chokepoint, and the treatment executors) lands separately.

Closes #574
