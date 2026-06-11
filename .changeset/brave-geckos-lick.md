---
"sohl": minor
---

Event Queue

Prior simple time-based event queue replaced with trigger-oriented event queue

- **Generalized from time-only to trigger-based dispatch.** Subscriptions identify a trigger (`updateWorldTime`, `combatStart`, `turnStart`, etc.) plus optional `fireAt` for time scheduling; `mod:` / `sm:` change application is integrated.
- **Substantial expansion** in scope (`c6bf726`) with matching test coverage.
- The retired `SOHL_EVENT` constants are gone in favor of the generalized trigger taxonomy.
