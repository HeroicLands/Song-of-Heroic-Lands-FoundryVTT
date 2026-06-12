---
"sohl": patch
---

**Fix the shared data-model schema spread**

`defineSohlDataSchema()` — the schema for the fields every SoHL data model is
meant to carry (`shortcode`, `docUrl`, `actionDefs`) — was defined but never
spread into any concrete schema, so those fields were absent from every item
and actor data model. Spread it into the item, actor, and combatant base
schemas so the fields exist and persist. `shortcode` is made lenient
(`initial: ""`), a safe default since it was previously unvalidated everywhere.
