---
"sohl": minor
---

**Driven-tour primitives and deterministic RNG for `SohlTour` (#624)**

Extend the guided-tour framework so an opinionated, _railroaded_ tour (the
Automated Combat tour) can drive the app down a fixed path with reproducible
dice, without regressing the coach-and-wait tours.

- **Drive steps.** A step may declare a `drive` array of actions that are
  _performed_ (not waited on) before the step is shown, each awaited in order so
  the next step's targets exist: `import-adventure`, `activate-scene`,
  `start-combat` (with optional `roll-initiative`), `advance-turn`, and
  `set-target` / `clear-target`. The sequencing/await logic is the Foundry-free
  `runDrive`; `SohlTour` supplies the Foundry-coupled executor.
- **Seeded RNG.** Setting `SohlTourConfig.seedRng` seeds `sohl.random` at tour
  start for reproducible scripted rolls and **guarantees restore on every exit
  path** — completion, abort, Escape, navigation (a `pagehide` safety net), and a
  mid-step error — via a fire-once `RngLease` registered at seed time. Restore
  rewinds the shared stream to its exact pre-tour position, so the user's real
  game is never left returning identical dice.

Coach-and-wait behaviour is unchanged; a step with no `drive`/`seedRng` behaves
exactly as before.
