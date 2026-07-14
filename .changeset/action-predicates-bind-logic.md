---
"sohl": patch
---

**Bind action and context-menu predicates to the logic layer**

Action `trigger` / `visible` predicates and context-menu `condition` predicates
now bind the **logic layer** instead of the raw Foundry documents, matching the
Active Effect predicate convention:

| Predicate                | Was                         | Now                                 |
| ------------------------ | --------------------------- | ----------------------------------- |
| Action `trigger`         | `item`, `actor` (documents) | `itemLogic`, `actorLogic`           |
| Action `visible`         | `element`, `item`, `isGM`   | `element`, `itemLogic`, `isGM`      |
| Context-menu `condition` | `target`, `item`, `actor`   | `target`, `itemLogic`, `actorLogic` |

The logic object is the stable, computed view predicate authors want; the owning
actor is reachable from an item as `itemLogic.actorLogic`. The `hasUsableSkill`
helper now takes the actor **logic** directly (`hasUsableSkill(actorLogic, …)`).

_Breaking for author-supplied predicates:_ any `trigger` / `visible` / `condition`
string that referenced `item` or `actor` must switch to `itemLogic` / `actorLogic`.
No data migration is required — predicates are re-evaluated at runtime.

Closes #380
