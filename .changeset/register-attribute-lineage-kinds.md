---
"sohl": minor
---

**Register the `attribute` and `lineage` item kinds**

The `attribute` and `lineage` item kinds shipped with data-model, logic, and
sheet classes but were never registered, so items of those kinds did not
function.
- Register both kinds in the item data-model, logic, and sheet registries so
  they load and behave like every other item kind.
- Fix `AttributeSheet`, which was a copy-paste of `TraitSheet` — it exported a
  class literally named `TraitSheet` and rendered trait fields. It now renders
  the attribute's own fields (`scoreBase`, `initDiceFormula`, value descriptors,
  and impairing body roles) via a new `attribute-properties.hbs` template, with
  the array fields shown read-only.
