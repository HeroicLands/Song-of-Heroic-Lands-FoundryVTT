---
"sohl": patch
---

**Fix: declare the `sohleffectdata` ActiveEffect subtype so effects get their data model**

`system.json` `documentTypes` declared an `activeeffectdata` ActiveEffect subtype
that no data model was registered for, while the add-effect action and
`CONFIG.ActiveEffect` use `sohleffectdata`. Creating a SoHL effect
(`type: "sohleffectdata"`) was therefore rejected as an invalid type, and effects
never received `SohlActiveEffectDataModel` — their `system.scope` / `system.changes`
were absent.

Declare `sohleffectdata` in `documentTypes` (a one-line rename) so the type is
valid and effects get their data model.

Fixes #145
