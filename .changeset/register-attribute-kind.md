---
"sohl": minor
---

**Register the `attribute` item kind**

The `attribute` item kind shipped with data-model, logic, and sheet classes but
was never registered, so items of that kind did not function.

- Register the kind in the item data-model, logic, and sheet registries so it
  loads and behaves like every other item kind.
- Fix `AttributeSheet`, which a copy-paste error left exporting the wrong class
  and rendering unrelated fields. It now renders the attribute's own fields
  (`scoreBase`, `initDiceFormula`, value descriptors, and impairing body roles)
  via a new `attribute-properties.hbs` template, with the array fields shown
  read-only.
