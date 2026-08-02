---
"sohl": patch
---

**Fix: Trauma sheet's Physical fieldset now renders for injuries**

The Trauma item sheet's **Physical** fieldset (impact aspect, body location,
blood-loss interval) never appeared. `templates/item/trauma-properties.hbs` gated
it on `{{#if (eq system.subType "physical")}}`, but there is no `"physical"` value
in `TRAUMA_SUBTYPE` — the physical-harm sub-type is `"injury"`
(`TRAUMA_SUBTYPE.INJURY`), a leftover from a `physical` → `injury` rename. The
comparison was always false, so those controls were unreachable.

The fieldset is now gated on the `injury` sub-type, so an injury's aspect / body
location / blood-loss interval are editable again while descriptive conditions
(which carry no damage aspect) correctly omit them.

Closes #927
