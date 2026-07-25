---
"sohl": minor
---

**Worn state is armor-only (`isWorn`)**

The worn/equipped concept now belongs to armor alone. Previously every gear
subtype (weapon, container, concoction, projectile, misc, and armor) carried a
generic `isEquipped` flag and rendered an "Equipped" checkbox on its properties
tab — dead weight and a misleading control everywhere but armor.

- `system.isEquipped` is removed from the shared gear data model; armor gains
  `system.isWorn` (`BooleanField`, `initial: false`).
- Only the **armor** properties sheet shows the worn control (labelled "Worn").
  The "Equipped" form-group is gone from weapon, container, concoction,
  projectile, and misc gear.
- `ArmorGearLogic` gains a `toggleWorn` intrinsic action (mirroring
  `toggleCarried`) that flips `system.isWorn`; the Being gear-list worn toggle
  and the armor-protection aggregation now read/write the armor-scoped field.
- New `SOHL.ArmorGear.FIELDS.isWorn.*` and `SOHL.ArmorGear.Action.toggleWorn`
  localization keys (the unused `SOHL.Gear.FIELDS.isEquipped.*` keys are retained
  per the stable-keys rule).

Closes #662
