---
"sohl": patch
---

**Show a Target label in the Effects tab**

The Effects tab on the Being sheet — and the Effects part on every Item sheet —
now renders a human-readable **Target** for each effect. The row templates bind
`effect.system.targetLabel`, but `SohlActiveEffectDataModel` never exposed that
getter, so the column always rendered blank.

`targetLabel` now maps the effect's `system.scope` (and the documents the effect
is embedded in) to a localized label: _This {itemType}_ / _This Actor: {name}_
for a `this` scope, _Actor_ for an `actor` scope, the strike-mode scope label for
the strike-mode scopes, and the item type's label for an item-kind scope. The
mapping lives in a Foundry-free helper (`resolveEffectTargetLabel`) so it is
unit-tested without Foundry.

Closes #796
