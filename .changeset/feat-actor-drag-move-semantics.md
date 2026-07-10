---
"sohl": minor
---

**Being sheet: correct actor→actor drag semantics (move, with quantity)**

Dropping an item onto an actor now behaves by source. Compendium and world items
still **clone** onto the actor (all kinds). An item that lives on **another
actor** is now **moved** — created here and removed from the source — instead of
duplicated:

- **Non-gear** (skill, trait, …) moves the instance.
- **Physical gear** moves with quantity: a **"How Many?"** dialog for stacks
  greater than one splits the stack (dest += chosen, source −= chosen, source
  removed when all moved). The dialog is skipped for a single item and for a
  **shift-drag**, which moves the whole stack. Moving requires owning the source.
