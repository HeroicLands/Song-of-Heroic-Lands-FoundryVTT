---
"sohl": minor
---

**Typed item-logic registry and actor-logic accessors**

Add a kind-indexed item-logic registry and typed lookup so callers get the
concrete logic type for an item kind without casting.
- **`getItemLogic(shortcode, kind)`** on the actor logic returns the concrete
  logic for that kind — e.g. `getItemLogic("stealth", ITEM_KIND.SKILL)` is typed
  `SkillLogic | undefined`. It matches on **both** `shortcode` and kind, so a
  shortcode shared across kinds cannot return an unexpected item.
- **`allLogics`** and **`logicTypes`** on the actor logic — the logic-layer
  analogues of `Actor#items` and `Actor#itemTypes`, with each group typed to its
  kind (`logicTypes.skill` is `SkillLogic[]`).
- **`sohl.actorLogics`** and **`sohl.itemLogics`** expose every world actor's and
  item's logic instance directly, instead of going through `game.actors` /
  `game.items` and reading each `.logic`.
- A precise `ITEM_LOGIC_DEF` registry with a compile-time completeness guard
  drives the `ItemLogicByKind` type map; registering a new item kind without a
  logic class is now a type error.
