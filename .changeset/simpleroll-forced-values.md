---
"sohl": minor
---

**Deterministic dice for tests: a forced-value queue built into SimpleRoll**

Add a process-wide **forced-value queue** to `SimpleRoll` (the single dice
chokepoint) so tests can drive an RNG-gated outcome that lives deep in the logic
layer — a success test's d100, an affliction's critical-failure→infection, the
combat exchange — without reaching the roll instance.

- **`SimpleRoll.forceValues(...values)`** seeds die values that `roll()` consumes
  one per die (FIFO) instead of `Math.random`; **`SimpleRoll.clearForced()`**
  empties the queue and **`SimpleRoll.forcedRemaining`** inspects it. When the
  queue is empty, rolls are random as before.
- **Forces the die _values_, not a total**, so `total`, `result` (`"[3, 5] +2"`),
  `formula`, and the Foundry-`Roll` display all derive correctly. Because almost
  every SoHL roll is a single die, this is effectively "one value per roll."
- Complements the existing per-instance `setRolls` / `SuccessTestResult` presets;
  a pre-seeded roll never touches the queue. Reachable from `sohl`
  (`sohl.entity.roll.SimpleRoll`) so an e2e can seed it in the game realm.
- **Hygiene:** a leftover forced value leaks into the next roll, so tests clear it
  in an `afterEach` (documented in the testing guide).

An e2e (`deterministic-dice.cy.js`) proves it end to end: forcing a real skill
success test's d100 to 5 succeeds and to 100 fails against ML 50. Follow-ups
tracked separately: a seedable Foundry-free PRNG (#599), and routing the non-dice
randomness (`weightedRandom`, the `rand()` helper, `BodyStructure` spread) through
the same seam.

Closes #598.
